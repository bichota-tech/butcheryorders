<!--contenido html de la vista home-->
<template>
    <div class="home-page">
        <h2>Panel de Gestión</h2>
        <div class="homecontainer">
            <Dashboard />
            <Voicebottom />
        </div>
    </div>
</template>

<!--contenido js de la vista home-->
<script setup> 
import Dashboard from '@/components/dashboard.vue';
import Voicebottom from '@/components/voicebottom.vue';
</script>

<!--contenido css de la vista home-->
<style scoped>
.home-page {
    width: 100%;
    padding: 0 1rem;
}

h2 {
    margin-top: 2rem;
    margin-bottom: 1.5rem;
    text-align: center;
    font-family: var(--font-text);
    font-weight: 600;
    font-size: 1.8rem;
}

.homecontainer {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    width: 100%;
    max-width: 1100px;
    margin: 0 auto;
}

/* Tablet: KPIs arriba, botón Añadir debajo */
@media (max-width: 1023px) {
    .homecontainer {
        flex-direction: column;
        gap: 1.25rem;
    }
}
</style>
