
/* tslint:disable */
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Copyright 2024 Google LLC

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     https://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

export type DetectTypes = 'Caixas delimitadoras 2D' | 'Máscaras de segmentação' | 'Pontos' | 'Detecção 3D';

export type BoundingBox2DType = {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
};

export type BoundingBoxMaskType = {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  imageData: string;
};

export type PointingType = {
  point: {
    x: number;
    y: number;
    z?: number;
  };
  label: string;
};

export type BoundingBox3DType = {
  center: { x: number; y: number; z: number };
  size: { w: number; h: number; d: number };
  label: string;
};
