---
title: Custom Tooltip Center
---

# Custom Tooltip Center

<script setup>
import {config} from './center';
</script>

<ChoroplethChart
  :options="config.options"
  :data="config.data"
/>

### Code

:::code-group

<<< ./center.ts#config [config]

<<< ./center.ts#data [data]

:::
