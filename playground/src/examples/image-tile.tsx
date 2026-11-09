import type { ImageTileLabels } from '@dsh-components'
import type * as React from 'react'
import type { ComponentExample } from './kit'
import { ImageTile } from '@dsh-components'
import { useState } from 'react'
import {
  lightboxLabels,
  Row,
  SAMPLE_IMAGE,
  SAMPLE_IMAGE_SQUARE,
  SAMPLE_IMAGE_TALL,
} from './kit'

const tileLabels: ImageTileLabels = {
  open: '预览图片',
  openNamed: (name: string): string => `预览 ${name}`,
  loading: '图片加载中',
  loadFailed: '图片加载失败，点击重试',
  lightbox: lightboxLabels,
}

/** The natural sizes of the bundled sample images. */
const WIDE_SIZE = { width: 960, height: 540 }
const TALL_SIZE = { width: 720, height: 900 }
const SQUARE_SIZE = { width: 600, height: 600 }

interface PreviewTile {
  readonly id: string
  readonly src: string
  readonly name: string
  readonly size: { readonly width: number, readonly height: number }
}

function SingleGallery({ tiles }: { readonly tiles: readonly PreviewTile[] }): React.JSX.Element {
  const [openId, setOpenId] = useState<string | null>(null)
  return (
    <Row>
      {tiles.map(tile => (
        <ImageTile
          key={tile.id}
          src={tile.src}
          name={tile.name}
          variant="single"
          dimensions={tile.size}
          open={openId === tile.id}
          onOpenChange={(open) => {
            setOpenId(open
              ? tile.id
              : null)
          }}
          labels={tileLabels}
        />
      ))}
    </Row>
  )
}

function TileGallery({ tiles }: { readonly tiles: readonly PreviewTile[] }): React.JSX.Element {
  const [openId, setOpenId] = useState<string | null>(null)
  return (
    <Row>
      {tiles.map(tile => (
        <ImageTile
          key={tile.id}
          src={tile.src}
          name={tile.name}
          variant="tile"
          open={openId === tile.id}
          onOpenChange={(open) => {
            setOpenId(open
              ? tile.id
              : null)
          }}
          labels={tileLabels}
        />
      ))}
    </Row>
  )
}

/**
 * A loaded thumbnail that opens its own preview.
 * @returns the tile.
 */
function LoadedThumbnail(): React.JSX.Element {
  const [open, setOpen] = useState(false)
  return (
    <ImageTile
      src={SAMPLE_IMAGE}
      name="横向示意图"
      variant="thumbnail"
      dimensions={WIDE_SIZE}
      open={open}
      onOpenChange={setOpen}
      labels={tileLabels}
    />
  )
}

/**
 * A failed thumbnail that recovers after the retry control is pressed.
 * @returns the tile.
 */
function RetryableTile(): React.JSX.Element {
  const [failed, setFailed] = useState(true)
  const [open, setOpen] = useState(false)
  return (
    <ImageTile
      src={SAMPLE_IMAGE_SQUARE}
      name="示例图表"
      variant="thumbnail"
      failed={failed}
      dimensions={SQUARE_SIZE}
      open={open}
      onOpenChange={setOpen}
      onRetry={() => {
        setFailed(false)
      }}
      labels={tileLabels}
    />
  )
}

const SINGLE_TILES: readonly PreviewTile[] = [
  {
    id: 'wide',
    src: SAMPLE_IMAGE,
    name: '横向示意图',
    size: WIDE_SIZE,
  },
  {
    id: 'tall',
    src: SAMPLE_IMAGE_TALL,
    name: '竖向示意图',
    size: TALL_SIZE,
  },
  {
    id: 'square',
    src: SAMPLE_IMAGE_SQUARE,
    name: '正方形图表',
    size: SQUARE_SIZE,
  },
]

const TILE_TILES: readonly PreviewTile[] = [
  {
    id: 'tile-wide',
    src: SAMPLE_IMAGE,
    name: '横向示意图',
    size: WIDE_SIZE,
  },
  {
    id: 'tile-tall',
    src: SAMPLE_IMAGE_TALL,
    name: '竖向示意图',
    size: TALL_SIZE,
  },
  {
    id: 'tile-square',
    src: SAMPLE_IMAGE_SQUARE,
    name: '正方形图表',
    size: SQUARE_SIZE,
  },
]

const example: ComponentExample = {
  name: 'image-tile',
  group: 'media',
  summary: '可点击的图片缩略图，按点击处打开原图预览。',
  states: [
    { title: '单图（三种比例，点击预览）', element: <SingleGallery tiles={SINGLE_TILES} /> },
    { title: '64px 方格裁切（点击预览）', element: <TileGallery tiles={TILE_TILES} /> },
    {
      title: '48px 缩略图：已加载、加载中、失败重试',
      element: (
        <Row>
          <LoadedThumbnail />
          <ImageTile
            src={null}
            name="待加载图片"
            variant="thumbnail"
            open={false}
            onOpenChange={() => {}}
            labels={tileLabels}
          />
          <RetryableTile />
        </Row>
      ),
    },
  ],
}

export default example
