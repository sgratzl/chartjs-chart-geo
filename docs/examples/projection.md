---
title: Equal Earth Projection
---

# Equal Earth Projection

<script setup>
import {config} from './projection';
</script>

<ChoroplethChart
  :options="config.options"
  :data="config.data"
/>

### Code

:::code-group

<<< ./projection.ts#config [config]

<<< ./albers.ts#data [data]

:::
