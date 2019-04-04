<!-- Copyright 2019 Ayogo Health Inc. -->
<template>
    <button type="menu"><slot></slot></button>
</template>
<script lang="ts">
    import Vue from 'vue';
    import MenuButton from './index';
    import { MenuButtonBehaviour } from './button';

    export default Vue.extend({
        name: "menu-button",
        data() {
            return {
                behaviour: null as null | MenuButtonBehaviour
            };
        },
        mounted() {
            if (this.$el.getAttribute('type') === 'menu' || this.$el.getAttribute('data-type') === 'menu') {
                this.behaviour = MenuButton(this.$el as HTMLButtonElement);
            }
        },
        beforeDestroy() {
            this.behaviour!.destroy();
            this.behaviour = null;
        }
    });
</script>
