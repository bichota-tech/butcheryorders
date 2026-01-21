<template>
    <footer class="footer">
        <div class="text">
            <p>Copyright © 2026 Carnicería Isidora.</p>
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
    background-color: var(--color-secondary);
    display: flex;
    justify-content: center;
    align-items: center;
    padding: .7rem;
}

.text{
    display: flex;
    justify-content: center;
    align-items: center;
    column-gap: .5rem;
}

a, p{
    text-decoration: none;
    color: var(--color-bg);
    margin: 0;
}

a:hover{
    text-decoration: underline;
}

</style>