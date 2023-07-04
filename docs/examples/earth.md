---
title: World Atlas
---

# World Atlas

<script setup>
import {config} from './earth';
</script>

<ChoroplethChart
  :options="config.options"
  :data="config.data"
/>

### Code

:::code-group

<<< ./earth.ts#config [config]

<<< ./earth.ts#data [data]

:::
