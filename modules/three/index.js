import nuxtPushPlugins from '@dword-design/nuxt-push-plugins'
import P from 'path'
import webpack from 'webpack'
import packageName from 'depcheck-package-name'

export default function () {
  this.options.build.transpile.push('three')
  nuxtPushPlugins(this, {
    fileName: P.join('three', 'plugin.js'),
    src: require.resolve('./plugin'),
  })
  this.addTemplate({
    fileName: P.join('three', 'component.vue'),
    src: require.resolve('./component.vue'),
  })
}
