<template>
    <footer class="footer">
        <div class="text">
            <p>Copyright © 2026 Carniceria Isidora.</p>
            <p>Diseñado y desarrollado por <RouterLink to="https://bichota-tech.github.io/acma/">ACMA</RouterLink>.</p>
        </div>
    </footer>
</template>
<script setup></script>
<style scoped>
/* Footer siempre al final */
.footer { 
    bottom: 0;
    width: 100%;
    height: auto;
    background-color: var(--color-secondary);
    text-align: center;
    padding: .5rem;
}

.text{
    display: flex;
    justify-content: center;
    column-gap: .5rem;
}

a{
    text-decoration: none;
    color: var(--color-bg);
}

a:hover{
    text-decoration: underline;
}

p {
    color: var(--color-bg);  
}
</style>