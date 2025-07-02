<template>
  <div class="w-full bg-[#181c23] text-gray-200 text-sm flex flex-wrap items-center gap-x-8 gap-y-2 px-4 py-2 border-b border-[#23242a] shadow-sm select-none">
    <span>Monedas: <span class="font-bold text-white">{{ metrics.active_cryptocurrencies?.toLocaleString() || '...' }}</span></span>
    <span>Intercambios: <span class="font-bold text-white">{{ metrics.markets?.toLocaleString() || '...' }}</span></span>
    <span>Cap. de mercado: <span class="font-bold text-white">{{ formatBillions(metrics.total_market_cap?.usd) }}</span>
      <span :class="marketCapChangeClass">{{ formatPercent(metrics.market_cap_change_percentage_24h_usd) }}</span>
    </span>
    <span>Volumen en 24 h: <span class="font-bold text-white">{{ formatBillions(metrics.total_volume?.usd) }}</span></span>
    <span>Dominio: <span class="font-bold text-yellow-400">BTC {{ formatPercent(metrics.market_cap_percentage?.btc, 1) }}</span> <span class="font-bold text-blue-400">ETH {{ formatPercent(metrics.market_cap_percentage?.eth, 1) }}</span></span>
    <span v-if="metrics.eth_gas_price">⛽ Gas: <span class="font-bold text-[#AFA]">{{ metrics.eth_gas_price }}</span> GWEI</span>
  </div>
</template>

<script>
export default {
  name: 'GlobalMetricsBar',
  data() {
    return {
      metrics: {},
      loading: true,
      error: null
    }
  },
  computed: {
    marketCapChangeClass() {
      const val = this.metrics.market_cap_change_percentage_24h_usd;
      if (val > 0) return 'text-[#AFA] font-bold';
      if (val < 0) return 'text-[#ea3943] font-bold';
      return 'text-gray-400';
    }
  },
  methods: {
    async fetchMetrics() {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/global');
        const data = await res.json();
        this.metrics = data.data;
      } catch (e) {
        this.error = 'No se pudieron cargar las métricas globales.';
      } finally {
        this.loading = false;
      }
    },
    formatBillions(val) {
      if (!val) return '...';
      if (val > 1e12) return (val / 1e12).toFixed(2) + ' B US$';
      if (val > 1e9) return (val / 1e9).toFixed(2) + ' mil M US$';
      if (val > 1e6) return (val / 1e6).toFixed(2) + ' M US$';
      return val.toLocaleString() + ' US$';
    },
    formatPercent(val, dec = 2) {
      if (val === undefined || val === null) return '...';
      const num = Number(val).toFixed(dec);
      return (val > 0 ? '+' : '') + num + '%';
    }
  },
  mounted() {
    this.fetchMetrics();
  }
}
</script>

<style scoped>
</style> 