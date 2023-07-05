---
title: Legend Customization
---

# Legend Customization

<script setup>
import {config} from './legend';
</script>

<ChoroplethChart
  :options="config.options"
  :data="config.data"
/>

### Code

:::code-group

<<< ./legend.ts#config [config]

<<< ./albers.ts#data [data]

:::
