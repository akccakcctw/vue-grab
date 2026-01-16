# Changelog

## [1.1.0](https://github.com/akccakcctw/vue-grab/compare/vue-grab-v1.0.0...vue-grab-v1.1.0) (2026-01-16)


### Features

* add vue plugin integration ([c1b7142](https://github.com/akccakcctw/vue-grab/commit/c1b7142c9f8796d0f7982cc4d8a4e65d2581e184))
* **core:** add api aliases ([a8e201f](https://github.com/akccakcctw/vue-grab/commit/a8e201fb437ee627daa65c4fd0575b1c050fcd8c))
* **core:** add collapse toggle ([0b87766](https://github.com/akccakcctw/vue-grab/commit/0b87766ca3c5c3825393e08b86a3cca9f9bccde1))
* **core:** add dom file resolver ([18c99b1](https://github.com/akccakcctw/vue-grab/commit/18c99b1ea5b77263eb7dd75ac32576f2309d93f0))
* **core:** add global api surface ([28fef8d](https://github.com/akccakcctw/vue-grab/commit/28fef8dacbadef27b5b3daeda2f20b32c0a0877e))
* **core:** add grabFromElement ([ab5d655](https://github.com/akccakcctw/vue-grab/commit/ab5d6553006c8318cd0b71abf9b6dc013dcde126))
* **core:** add onCopy hook ([c89cf37](https://github.com/akccakcctw/vue-grab/commit/c89cf370e3506f09f2d2aa6701adf6a8388527b7))
* **core:** add overlay highlight and copy ([7726389](https://github.com/akccakcctw/vue-grab/commit/7726389233157de4b605bbaf3058e8450613872c))
* **core:** add programmatic highlight ([4a30c91](https://github.com/akccakcctw/vue-grab/commit/4a30c91c7bd5de524bac02d0294a762fbaa99d45))
* **core:** add toggle widget and safe copy ([7fc68d4](https://github.com/akccakcctw/vue-grab/commit/7fc68d456569b680ddec51d6453005eeae7fa4b6))
* **core:** allow disabling click copy ([e0fecc0](https://github.com/akccakcctw/vue-grab/commit/e0fecc0a602324a9b1c8c8705ac4994820b8dbc8))
* **core:** allow overlay style options ([555e4e5](https://github.com/akccakcctw/vue-grab/commit/555e4e568f9574880cb0665401974cfa7699273d))
* **core:** enrich component metadata ([be1a818](https://github.com/akccakcctw/vue-grab/commit/be1a818b3de7c6c9d0aace2538eab255619f6ab1))
* **core:** include vnode location metadata ([3e2264a](https://github.com/akccakcctw/vue-grab/commit/3e2264a4ca13bfbd09d96aae30388d7d9e09cc30))
* **core:** make toggle draggable ([91161b8](https://github.com/akccakcctw/vue-grab/commit/91161b81c88c56d6f87e14d7d280f56e6f1d8fc4))
* **core:** show hover file tooltip ([10e8350](https://github.com/akccakcctw/vue-grab/commit/10e8350815610a87f7e6f415ed993081e95fe1b0))
* **core:** support dom fallback ([f4baf63](https://github.com/akccakcctw/vue-grab/commit/f4baf63c3e4cf847ea23b1bac1c7ffef37725d01))
* **core:** support runtime overlay style updates ([6f083aa](https://github.com/akccakcctw/vue-grab/commit/6f083aa0bf6d8341529d504871e47ee2fb962fd9))
* export overlay option types ([9f7eb8d](https://github.com/akccakcctw/vue-grab/commit/9f7eb8d0c478b814cb42c376d91bc92605f27e6b))
* initial project setup with component identification core and SDD ([b7c0af9](https://github.com/akccakcctw/vue-grab/commit/b7c0af906e715dbf73bd865644eb6336debfe4ed))
* **nuxt:** add module integration ([278b9ea](https://github.com/akccakcctw/vue-grab/commit/278b9ea0984e2fe1b23c917fe2569aebde7f981f))
* **overlay:** deactivate widget and show 'Copied!' message after copy ([fcb060d](https://github.com/akccakcctw/vue-grab/commit/fcb060de7204ee2725c2b985a9c6759cfcfd22dc))
* **widget:** update floating button style to match react-grab design ([362a6ab](https://github.com/akccakcctw/vue-grab/commit/362a6ab76881e5b8195d190c28beadd441357cd7))


### Bug Fixes

* **core:** avoid vue proxy enumeration ([7d9738e](https://github.com/akccakcctw/vue-grab/commit/7d9738e450facc9afab2ad3686d1146b6b8aa85a))
* **core:** cap metadata serialization ([6908a45](https://github.com/akccakcctw/vue-grab/commit/6908a45594d18e5f1353018bc1cfb282180ac00a))
* **core:** clamp tooltip within viewport ([f0c0c64](https://github.com/akccakcctw/vue-grab/commit/f0c0c643f9fd96345fa3e5a23e2f295d238e9edd))
* **core:** fallback to parent metadata ([5fd0263](https://github.com/akccakcctw/vue-grab/commit/5fd0263161cfc39fe509414448e8e35f68d66b7b))
* **core:** guard against cross-origin data ([a5c989c](https://github.com/akccakcctw/vue-grab/commit/a5c989c3862fa82f80dcc03ecad7259d7c00312b))
* **core:** omit missing line columns ([0ad5c5a](https://github.com/akccakcctw/vue-grab/commit/0ad5c5a5b11f6f13bdbf7d4e20d51d62483ca5ee))
* **core:** stop click propagation ([624e61a](https://github.com/akccakcctw/vue-grab/commit/624e61ab2fca4265d97da84c8b1269524226be77))
* **core:** tighten collapsed toolbar ([7e8d62b](https://github.com/akccakcctw/vue-grab/commit/7e8d62b134db6e24683e04c64218cd3977ab78cc))
* **core:** use rootDir for tooltip path ([fd9da83](https://github.com/akccakcctw/vue-grab/commit/fd9da83734bfe046127918a4dee8948ecf795248))
* **deps:** add @nuxt/kit to devDependencies ([015df08](https://github.com/akccakcctw/vue-grab/commit/015df0881a6968c4d9d73a7cec704bf972ace42e))
* **nuxt:** ensure module runs in local dev ([65c3a03](https://github.com/akccakcctw/vue-grab/commit/65c3a0335153d38d934fcd945485a58b562c24c7))
* **nuxt:** load plugin on client ([7dbb10b](https://github.com/akccakcctw/vue-grab/commit/7dbb10bcd7690c63f3b370cc8ef1c1333577fef3))
* **nuxt:** use module field in metadata ([aedc71d](https://github.com/akccakcctw/vue-grab/commit/aedc71dd07b541f1903e52ec62fed3e4f090246b))
* **overlay:** suppress original click event during inspection ([d68c560](https://github.com/akccakcctw/vue-grab/commit/d68c560269b59fedb4361a0f5e5205059ef22044))
* **pkg:** remove nuxt module export from client entry to avoid node deps ([c669748](https://github.com/akccakcctw/vue-grab/commit/c669748a0f96ad44db512ff0036b6c0524159ed0))
* **plugin:** prevent ReferenceError by accessing process via global scope ([696c258](https://github.com/akccakcctw/vue-grab/commit/696c258feb84435af22d73eeb33484b846e7cf9c))
* **plugin:** safely access process.env to avoid ReferenceError in browser ([b929ab4](https://github.com/akccakcctw/vue-grab/commit/b929ab41e2de9ba612beba0a4cb7172816f7f272))


### Reverts

* remove react-grab toolbar attribute ([be088d5](https://github.com/akccakcctw/vue-grab/commit/be088d540d879165c7036aa50634ec3bd2423180))
