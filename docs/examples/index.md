---
title: Examples
---

# Examples

<script setup>
import {config} from './albers';
import {config as bubble} from './bubbleMap';
</script>

## Choropleth Map

<ChoroplethChart
  :options="config.options"
  :data="config.data"
/>

### Code

:::code-group

<<< ./albers.ts#config [config]

<<< ./albers.ts#data [data]

:::

## Bubble Map

<BubbleMapChart
  :options="bubble.options"
  :data="bubble.data"
/>

### Code

:::code-group

<<< ./bubbleMap.ts#config [config]

<<< ./bubbleMap.ts#data [data]

:::
