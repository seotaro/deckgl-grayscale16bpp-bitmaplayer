import React, { useState, useEffect } from 'react';

import DeckGL from '@deck.gl/react';
import { BitmapLayer, GeoJsonLayer, SolidPolygonLayer } from '@deck.gl/layers';
import { COORDINATE_SYSTEM, MapView, _GlobeView as GlobeView } from '@deck.gl/core';
import GL from '@luma.gl/constants';
import { Texture2D } from '@luma.gl/webgl'

import { latlonlineGeoJson } from './utils'
import Grayscale16bppBitmapLayer from './Grayscale16bppBitmapLayer'

const SETTINGS = {
  initialViewState: {
    longitude: 140.0,
    latitude: 40.0,
    zoom: 1.0,
  },
  mapLayer: {
    color: [64, 64, 64],
    url: 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_land.geojson'
  },
  backgroundLayer: {
    color: [32, 32, 32]
  },
  latlonLineLayer: {
    color: [127, 127, 127]
  },
  latlonGridLayer: {
    color: [127, 255, 127]
  },
  highlight: {
    color: [255, 127, 127, 127]
  },
};

const WIDTH = 256;
const HEIGHT = 256;

const DEFAULT_TEXTURE_PARAMETERS = {
  [GL.TEXTURE_MIN_FILTER]: GL.NEAREST,
  [GL.TEXTURE_MAG_FILTER]: GL.NEAREST,
  [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
  [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE,
};

// RGBA 8bpp のテクスチャを生成する
const createRGBA8bppTexture = (gl) => {
  // 緯度方向にグラデーション（線形補間）させる
  const src = new Uint8Array(WIDTH * 4 * HEIGHT);
  for (let j = 0; j < HEIGHT; j++) {
    const luminance = j / HEIGHT * 0xff;
    const pixel = new Uint8Array([luminance, luminance, luminance, 255]);

    const line = new Uint8Array(WIDTH * 4);
    for (let i = 0; i < WIDTH; i++) {
      line.set(pixel, i * 4);
    }
    src.set(line, WIDTH * 4 * j);
  }

  const texture = new Texture2D(gl, {
    data: src,
    format: GL.RGBA,
    type: GL.UNSIGNED_BYTE,
    width: WIDTH,
    height: HEIGHT,
    parameters: { ...DEFAULT_TEXTURE_PARAMETERS },
    pixelStore: { [GL.UNPACK_ALIGNMENT]: 4 },
    mipmaps: true,
  });

  return texture;
}

// Grayscale 8bpp のテクスチャを生成する
const createGrayscale8bppTexture = (gl) => {
  // 緯度方向にグラデーション（線形補間）させる
  const src = new Uint8Array(WIDTH * HEIGHT);
  for (let j = 0; j < HEIGHT; j++) {
    const luminance = j / HEIGHT * 0xff;
    const line = new Uint8Array(WIDTH).fill(luminance);
    src.set(line, WIDTH * j);
  }

  const texture = new Texture2D(gl, {
    data: src,
    format: GL.LUMINANCE,
    type: GL.UNSIGNED_BYTE,
    width: WIDTH,
    height: HEIGHT,
    parameters: { ...DEFAULT_TEXTURE_PARAMETERS },
    pixelStore: { [GL.UNPACK_ALIGNMENT]: 1 },
    mipmaps: true,
  });

  return texture;
}

// Grayscale 16bpp のテクスチャを生成する
const createGrayscale16bppTexture = (gl) => {
  // 緯度方向にグラデーション（線形補間）させる
  const src = new Uint16Array(WIDTH * HEIGHT);
  for (let j = 0; j < HEIGHT; j++) {
    const luminance = j / HEIGHT * 0xffff;
    const line = new Uint16Array(WIDTH).fill(luminance);
    src.set(line, WIDTH * j);
  }

  // Uint16Array から Uint8Array にキャストする。
  const dataView = new DataView(src.buffer);
  const dest = new Uint8Array(src.length * 2);
  for (let i = 0; i < src.length; i++) {
    const offset = i * 2;
    dest[offset + 0] = dataView.getUint8(offset + 0);
    dest[offset + 1] = dataView.getUint8(offset + 1);
  }

  const texture = new Texture2D(gl, {
    data: dest,
    format: GL.LUMINANCE_ALPHA,
    type: GL.UNSIGNED_BYTE,
    width: WIDTH,
    height: HEIGHT,
    parameters: { ...DEFAULT_TEXTURE_PARAMETERS },
    pixelStore: { [GL.UNPACK_ALIGNMENT]: 2 },
    mipmaps: true,
  });

  return texture;
}

function App() {
  const [gl, setGl] = useState(null);
  const [texture, setTexture] = useState({
    'rgba8bpp': null,
    'grayscale8bpp': null,
    'grayscale16bpp': null
  });

  useEffect(() => {
    if (gl != null) {
      setTexture({
        'rgba8bpp': createRGBA8bppTexture(gl),
        'grayscale8bpp': createGrayscale8bppTexture(gl),
        'grayscale16bpp': createGrayscale16bppTexture(gl)
      });
    }
  }, [gl]);

  const layers = [
    new SolidPolygonLayer({
      id: 'background-layer',
      data: [[[-180, 90], [0, 90], [180, 90], [180, -90], [0, -90], [-180, -90]]],
      getPolygon: d => d,
      filled: true,
      getFillColor: SETTINGS.backgroundLayer.color,
    }),
    new GeoJsonLayer({
      id: "map-layer",
      data: SETTINGS.mapLayer.url,
      filled: true,
      getFillColor: SETTINGS.mapLayer.color,
    }),

    new BitmapLayer({
      id: "grayscale8bpp-bitmap-layer",
      bounds: [95.0, 60.0, 110.0, 20.0],
      _imageCoordinateSystem: COORDINATE_SYSTEM.LNGLAT,
      image: texture['grayscale8bpp'],
      opacity: 0.75,
    }),
    new BitmapLayer({
      id: "rgba8bpp-bitmap-layer",
      bounds: [70.0, 60.0, 90.0, 20.0],
      _imageCoordinateSystem: COORDINATE_SYSTEM.LNGLAT,
      image: texture['rgba8bpp'],
      opacity: 0.75,
    }),

    new Grayscale16bppBitmapLayer({
      id: "grayscale16bpp-bitmap-layer",
      bounds: [120.0, 60.0, 160.0, 20.0],
      _imageCoordinateSystem: COORDINATE_SYSTEM.LNGLAT,
      image: texture['grayscale16bpp'],
      opacity: 0.75,
      lower: 0.0,
      upper: 65535.0,
      gamma: 1.0,
    }),

    new GeoJsonLayer({
      id: "latlon-line-layer",
      data: latlonlineGeoJson,
      stroked: true,
      getLineColor: SETTINGS.latlonLineLayer.color,
      lineWidthUnits: 'pixels',
      lineWidthScale: 1,
      getLineWidth: 1,
    }),
  ];

  return (
    <DeckGL
      initialViewState={SETTINGS.initialViewState}
      controller={true}
      layers={layers}
      onWebGLInitialized={gl => {
        console.log(gl)
        setGl(gl);
      }}
    >
      <GlobeView id="map" width="100%" controller={true} resolution={1} />
      {/* <MapView id="map" width="100%" controller={true} /> */}
    </DeckGL>
  );
}

export default App;
