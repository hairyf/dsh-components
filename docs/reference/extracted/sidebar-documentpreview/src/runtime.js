// Extracted from @deepseek-ai/dsh-client-ui-sidebar-documentpreview (lib/client.pdf.js); region lib/types/client/pdf/runtime.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** One real module Worker and PDF.js loading task per mounted binary document. */
		const WORKER_READY = "dsh-pdf-worker-ready";
		/**
		* Open complete PDF bytes with an explicitly owned Worker. Startup failure
		* never falls back to main-thread PDF parsing. Disposal keeps the Worker alive
		* for PDF.js teardown, except after a fatal worker error, then terminates the
		* native Worker and revokes its source URL.
		* @param data - complete PDF bytes retained by the preview; the worker receives a copy.
		* @param signal - document/body lifetime.
		* @param reportFailure - reports a fatal Worker failure, including failures after document loading.
		* @returns the pending document and idempotent asynchronous cleanup.
		*/
		function openPdf(data, signal, reportFailure) {
			const lifetime = new AbortController();
			const stopped = AbortSignal.any([signal, lifetime.signal]);
			const failed = Promise.withResolvers();
			const broken = Promise.withResolvers();
			let url;
			let worker;
			let bridge;
			let loading;
			let closing;
			let removeReady;
			const workerFailed = (event) => {
				const error = new PdfWorkerFailure(event);
				failed.reject(error);
				broken.resolve(void 0);
				try {
					if (!stopped.aborted) reportFailure(error);
				} catch (failure) {
					console.error("[pdf] failure callback threw", failure);
				} finally {
					dispose();
				}
			};
			const aborted = () => {
				failed.reject(stopped.reason);
				dispose();
			};
			stopped.addEventListener("abort", aborted, { once: true });
			const dispose = () => {
				if (closing !== void 0) return closing;
				closing = Promise.resolve().then(async () => {
					try {
						if (loading !== void 0) await Promise.race([loading.destroy(), broken.promise]);
					} finally {
						removeReady?.();
						stopped.removeEventListener("abort", aborted);
						bridge?.destroy();
						worker?.removeEventListener("error", workerFailed);
						worker?.removeEventListener("messageerror", workerFailed);
						worker?.terminate();
						if (url !== void 0) URL.revokeObjectURL(url);
					}
				}).catch((error) => {
					console.error("[pdf] cleanup failed", error);
				});
				lifetime.abort();
				return closing;
			};
			const initialize = async () => {
				stopped.throwIfAborted();
				const BinaryDataFactory = createPdfBinaryDataFactory();
				const bytes = data.slice();
				url = URL.createObjectURL(new Blob([_dsh_pdf_worker_default, `\nself.postMessage({type:${JSON.stringify(WORKER_READY)}});\n`], { type: "text/javascript" }));
				worker = new Worker(url, {
					type: "module",
					name: "dsh-pdf"
				});
				worker.addEventListener("error", workerFailed);
				worker.addEventListener("messageerror", workerFailed);
				const started = Promise.withResolvers();
				const ready = (event) => {
					if (typeof event.data !== "object" || event.data === null || !("type" in event.data) || event.data.type !== WORKER_READY) return;
					started.resolve(void 0);
				};
				worker.addEventListener("message", ready);
				const port = worker;
				removeReady = () => {
					port.removeEventListener("message", ready);
				};
				await Promise.race([started.promise, failed.promise]);
				removeReady();
				stopped.throwIfAborted();
				bridge = PDFWorker$1.create({ port });
				loading = getDocument$1({
					data: bytes,
					worker: bridge,
					BinaryDataFactory,
					cMapPacked: true,
					useWorkerFetch: false,
					enableXfa: false,
					stopAtErrors: true,
					isEvalSupported: false
				});
				return loading.promise;
			};
			return {
				document: Promise.race([initialize(), failed.promise]).catch(async (error) => {
					await dispose();
					throw error;
				}),
				dispose
			};
		}
