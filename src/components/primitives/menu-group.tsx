import type * as React from 'react'
import { useId } from 'react'
import { useStyle } from '../../lib/style'

const CSS = `/* recovered from @deepseek-ai/dsh-client-ui-primitives/lib/MenuGroup.module.css */
.group {
  position: relative;
}

.start {
  position: absolute;
  top: 0;
  left: 0;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.group + .group {
  margin-top: 3px;
}

.heading {
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 4px 7px 2px;
  background: transparent;
  color: var(--dsw-alias-label-tertiary);
  font-size: 11px;
  line-height: 16px;
  font-weight: 500;
}

.heading[data-stuck] {
  background: var(--dsw-alias-menu-group-header-fill);
}

:global(html:not([data-platform='darwin'])) .heading {
  border-radius: var(--dsw-radius-md);
}
`

/** Props for {@link MenuGroup}. */
export interface MenuGroupProps {
  /** Caller-localized group label, exposed as the group's accessible name. */
  label: string
  /** Optional menu rows of this group. */
  children?: React.ReactNode
}

/**
 * Render a named group with an instance-owned heading id and an inaccessible position sentinel.
 */
export function MenuGroup({ label, children }: MenuGroupProps): React.JSX.Element {
  const s = useStyle('menu-group', CSS)
  const headingId = useId()
  return (
    <section role="group" aria-labelledby={headingId} data-menu-group="" className={s.group}>
      <span aria-hidden="true" data-menu-group-start="" className={s.start} />
      <div id={headingId} data-menu-group-heading="" className={s.heading}>
        {label}
      </div>
      {children}
    </section>
  )
}

interface GroupState {
  section: HTMLElement
  heading: HTMLElement
  start: HTMLElement
  atTop: boolean
  above: boolean
  topTime: number
  aboveTime: number
}

/**
 * Update heading backgrounds asynchronously from native intersection and viewport-size observations.
 * Headings remain transparent until observations identify a section crossing the viewport top.
 * Without IntersectionObserver or ResizeObserver, CSS sticky headings remain transparent.
 * Group membership is captured at setup; dispose before observing changed groups or the same viewport again.
 * @param viewport - Unpadded, borderless scroll container with direct MenuGroup children.
 * @returns Cleanup owning both intersection observers and the viewport resize observer.
 */
export function observeStickyMenuGroups(viewport: HTMLElement): () => void {
  const sectionList: HTMLElement[] = Array.from(
    viewport.querySelectorAll<HTMLElement>(':scope > [data-menu-group]'),
  )
  const groups: GroupState[] = sectionList.flatMap((section) => {
    const heading = section.querySelector<HTMLElement>(':scope > [data-menu-group-heading]')
    const start = section.querySelector<HTMLElement>(':scope > [data-menu-group-start]')
    return heading === null || start === null
      ? []
      : [
          {
            section,
            heading,
            start,
            atTop: false,
            above: false,
            topTime: -Infinity,
            aboveTime: -Infinity,
          },
        ]
  })
  if (groups.length === 0 || typeof IntersectionObserver === 'undefined' || typeof ResizeObserver === 'undefined')
    return () => {}
  const sections = new Map(groups.map(group => [group.section, group]))
  const starts = new Map(groups.map(group => [group.start, group]))
  let disposed = false
  let stripObserver: IntersectionObserver | undefined
  let viewportHeight: number | undefined
  const render = (group: GroupState): void => {
    const stuck = group.atTop && group.above
    if (group.heading.hasAttribute('data-stuck') !== stuck)
      group.heading.toggleAttribute('data-stuck', stuck)
  }
  const startObserver = new IntersectionObserver((entries) => {
    if (disposed)
      return
    for (const entry of entries) {
      const group = starts.get(entry.target as HTMLElement)
      if (!group || entry.rootBounds === null || entry.time < group.aboveTime)
        continue
      group.above = entry.boundingClientRect.top < entry.rootBounds.top
      group.aboveTime = entry.time
      render(group)
    }
  }, {
    root: viewport,
    threshold: [0, 1],
  })
  for (const { start } of groups)
    startObserver.observe(start)
  const sizeObserver = new ResizeObserver((entries) => {
    if (disposed)
      return
    for (const entry of entries) {
      if (entry.target !== viewport || entry.contentRect.height === viewportHeight)
        continue
      viewportHeight = entry.contentRect.height
      stripObserver?.disconnect()
      const observer = new IntersectionObserver((intersections) => {
        if (disposed || stripObserver !== observer)
          return
        for (const intersection of intersections) {
          const group = sections.get(intersection.target as HTMLElement)
          if (!group || intersection.rootBounds === null)
            continue
          const top = intersection.rootBounds.top
          if (intersection.time >= group.topTime) {
            group.atTop = intersection.isIntersecting && intersection.boundingClientRect.bottom > top
            group.topTime = intersection.time
          }
          if (intersection.time >= group.aboveTime) {
            group.above = intersection.boundingClientRect.top < top
            group.aboveTime = intersection.time
          }
          render(group)
        }
      }, {
        root: viewport,
        rootMargin: `0px 0px ${String(Math.min(1, viewportHeight) - viewportHeight)}px 0px`,
        threshold: 0,
      })
      stripObserver = observer
      for (const { section } of groups)
        observer.observe(section)
    }
  })
  sizeObserver.observe(viewport)
  return () => {
    if (disposed)
      return
    disposed = true
    startObserver.disconnect()
    stripObserver?.disconnect()
    sizeObserver.disconnect()
    for (const { heading } of groups) {
      if (heading.hasAttribute('data-stuck'))
        heading.removeAttribute('data-stuck')
    }
  }
}
