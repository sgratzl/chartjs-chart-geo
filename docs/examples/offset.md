---
title: Projection Offset
---

# Projection Offset and Scale

<script setup>
import {offset, scale} from './offset';
</script>

## Projection Offset

<ChoroplethChart
  :options="offset.options"
  :data="offset.data"
/>

### Code

:::code-group

<<< ./offset.ts#config [config]

<<< ./albers.ts#data [data]

:::

## Projection Scale

<ChoroplethChart
  :options="scale.options"
  :data="scale.data"
/>

### Code

:::code-group

<<< ./offset.ts#scale [config]

<<< ./albers.ts#data [data]

:::
