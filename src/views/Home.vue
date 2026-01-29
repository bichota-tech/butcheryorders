<!--contenido html de la vista home-->
<template>
    <h2>Panel de Gestión</h2>
    <div class="homecontainer">
        <Dashboard />
        <Voicebottom />
    </div>
</template>

<!--contenido js de la vista home-->
<script setup> 

import Dashboard from '@/components/dashboard.vue';
import Voicebottom from '@/components/voicebottom.vue';

</script>

<!--contenido css de la vista home-->
<style  scoped>
.homecontainer {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    padding: 2rem;
    width: 100%;
    height: auto;

}

h2{
    margin-top: 3rem;
    text-align: center;
    font-family: var(--font-text);
    font-weight: 600;
    font-size: 1.8rem;
}

</style>