---
title: Bubble Map Area Mode
---

# Bubble Map Area Mode

<script setup>
import {config} from './area';
</script>

<BubbleMapChart
  :options="config.options"
  :data="config.data"
/>

### Code

:::code-group

<<< ./area.ts#config [config]

<<< ./bubbleMap.ts#data [data]

:::
