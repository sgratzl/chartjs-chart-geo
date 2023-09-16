---
title: Custom Color Scale
---

# Custom Color Scale

<script setup>
import {config} from './custom';
</script>

<ChoroplethChart
  :options="config.options"
  :data="config.data"
/>

### Code

:::code-group

<<< ./custom.ts#config [config]

<<< ./albers.ts#data [data]

:::
