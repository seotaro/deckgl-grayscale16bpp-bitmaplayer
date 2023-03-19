# deckgl-grayscale16bpp-bitmaplayer

## Demo

[Live Demo](https://seotaro.github.io/deckgl-grayscale16bpp-bitmaplayer/)

<img width="500" alt="image" src="https://user-images.githubusercontent.com/46148606/226151583-fd146b8e-a70a-42b6-a15c-65d11eed9c33.png">

## Install

```bash
yarn
```

## Run

```bash
yarn start
```

## Notes

Available parameter combinations in luma.gl's [Texture2D](https://tsherif.github.io/luma.gl/docs/api-reference/webgl/texture-2d.html).

|  format  |  type  |  pixelStore[GL.UNPACK_ALIGNMENT]   |  *bpp*  |
| ---- | ---- | ---- | ---- |
|  RGBA  |  UNSIGNED_BYTE  |  4  |  *32*  |
|  RGB  |  UNSIGNED_BYTE  |  1  |  *24*  |
|  LUMINANCE_ALPHA  |  UNSIGNED_BYTE  |  2  |  *16*  |
|  LUMINANCE  |  UNSIGNED_BYTE  |  1  |  *8*  |
