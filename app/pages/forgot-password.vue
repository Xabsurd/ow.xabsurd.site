<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <AuthFormShell :title="t('auth.forgotPassword')" description="Password reset is reserved for the next iteration." />
</template>
