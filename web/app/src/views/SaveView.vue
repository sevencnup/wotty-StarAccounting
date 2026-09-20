<template>
  <div class="save-view">
    <div class="save-card">
      <h1>Save</h1>
      <p>Saving screen in progress.</p>
    </div>
  </div>
</template>

<style scoped>
.save-view {
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.save-card {
  width: 100%;
  max-width: 320px;
  border-radius: 22px;
  background: #ffffff;
  box-shadow: 0 10px 22px rgba(21, 66, 144, 0.08);
  padding: 28px 24px;
  text-align: center;
}

.save-card h1 {
  font-size: 24px;
  line-height: 1.1;
  font-weight: 800;
  color: #121826;
}

.save-card p {
  margin-top: 10px;
  font-size: 14px;
  color: #707b92;
}
</style>