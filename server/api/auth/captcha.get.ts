import { createCaptcha } from '../../utils/captcha'

export default defineEventHandler((event) => createCaptcha(event))
