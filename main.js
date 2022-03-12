(async () => {
    'use strict'

    const tf = require('@tensorflow/tfjs-node')
    const got = require('got').default
    const nsfw = require('nsfwjs')
    const Express = require('express')

    const model = await nsfw.load()
    const classifyImage = async (url) => {
        let raw = await got(url).buffer()
        
        let tfImage = await tf.node.decodeImage(raw)
        let data = await model.classify(tfImage)
        tfImage.dispose()

        return data
    }

    const respondObject = (success, data) => {
        return {
            success, data
        }
    }

    Express()
        .get('/get', async (req, res) => {
            try {
                let { url } = req.query
                if ( !url || !url.startsWith('http') )
                    return res.json(respondObject(false, 'No url provided'))

                url = decodeURIComponent(url)
                res.json(respondObject(true, await classifyImage(url)))
            } catch (err) {
                res.json(respondObject(false, err.message))
            }
        })
        .all('*', (_, res) => res.end('nsfwd - shiro.'))
        .listen(55569, () => console.log('listening on port 55569'))
})()