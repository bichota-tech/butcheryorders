<template>
    <h2>Pedidos Recientes</h2>
    <div class="ordercontainer">
        <OrderList />
        <Card />
    </div>
</template>

<script setup>
import Card from '@/components/card.vue';
import OrderList from '@/components/orderlist.vue'  
</script>

<style scoped>
.ordercontainer{
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: space-between;
    align-items: initial;    
    gap: 2rem;
    width: 100%;
}

h2{
    margin-top: 3rem;
    text-align: center;
    font-family: var(--font-text);
    font-weight: 600;
    font-size: 1.8rem;
}

</style>
