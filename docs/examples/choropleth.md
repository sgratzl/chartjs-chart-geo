---
title: Choropleth US Map
---

# Choropleth US Map

<script setup>
import {config} from './albers';
</script>

<ChoroplethChart
  :options="config.options"
  :data="config.data"
/>

### Code

:::code-group

<<< ./albers.ts#config [config]

<<< ./albers.ts#data [data]

:::
