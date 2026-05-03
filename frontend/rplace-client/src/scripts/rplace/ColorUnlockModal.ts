import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ColorUnlockModal',
  props: {
    color: {
      type: String,
      required: true
    }
  },
  emits: ['close', 'unlock']
});
