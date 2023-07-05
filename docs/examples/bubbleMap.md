---
title: Bubble Map
---

# Bubble Map

<script setup>
import {config} from './bubbleMap';
</script>

<BubbleMapChart
  :options="config.options"
  :data="config.data"
/>

### Code

:::code-group

<<< ./bubbleMap.ts#config [config]

<<< ./bubbleMap.ts#data [data]

:::
