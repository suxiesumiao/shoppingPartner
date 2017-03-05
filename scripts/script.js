let timer
let app = new Vue({
    el: '#app',
    data: {
        // food 是推荐菜谱中的列表
        food: [],
        // mixture 是某一道菜的食材表
        mixture: [],
        // shoppingTrolley 是加入到购物车中的列表
        shoppingTrolley: [],
        // result 是总计价
        result: 0.00,
        // 记录某一次的对菜谱的点击，默认是第一个
        clickedIndex: 0
    },
    created: function () {
        this.init()
    },
    methods: {
        getMixture: function (item, index) {
            this.mixture = this.food[index].ellipsis
            this.food[this.clickedIndex].isClicked = false
            item.isClicked = true
            this.clickedIndex = index
        },
        getRandomPrize: function (min, max) {
            return Math.random() * (max - min) + min
        },
        // putInTrolley将点击的每一道食材加到购物车之中
        // 并且计算总的价格 赋值 给 Total 也就是 result
        putInTrolley: function (item) {
            if (this.shoppingTrolley.length === 0) {
                this.shoppingTrolley.push({
                    name: item.name,
                    price: item.singlePrice,
                    isCanceled: item.isCanceled
                })
            } else {
                let length = this.shoppingTrolley.length
                for (let i = 0; i < length; i++) {
                    // 对于已经添加过的食材的处理
                    if (this.shoppingTrolley[i].name === item.name) {
                        let tempEl = this.$el.lastChild.firstChild
                        tempEl.innerText = `${item.name}已经添加过了哟😳在这里再找找看`
                        tempEl.classList.add('addTooMuch')
                        let timer = null
                        clearTimeout(timer)
                        timer = setTimeout(function () {
                            tempEl.innerText = ''
                            tempEl.classList.remove('addTooMuch')
                        }, 1000);
                        break
                    }
                    if (i === length - 1) {
                        this.shoppingTrolley.push({
                            name: item.name,
                            price: item.singlePrice,
                            isCanceled: item.isCanceled
                        })
                    }
                }
            }
            let resultTemp = 0
            for (let i = 0; i < this.shoppingTrolley.length; i++) {
                // 该处只要取isCanceled是false的值
                if (!this.shoppingTrolley[i].isCanceled) {
                    resultTemp += this.shoppingTrolley[i].price
                }
            }
            this.result = resultTemp.toFixed(2)
        },
        // 取消购买购物车中的食材
        // item是列表中的食材信息
        // index 是食材在列表中的位置
        cancel: function (item, index) {
            if(item.isCanceled){
                this.result = (Number(this.result) + item.price).toFixed(2)
            }else{
                this.result = (this.result - item.price).toFixed(2)
            }
            item.isCanceled = !item.isCanceled
        },
        // 该函数产生食材价格表 该表是一个对象
        priceMaker: function (initArray) {
            let totalArray = []
            for (let i = 0; i < initArray.length; i++) {
                totalArray.push(initArray[i].ellipsis)
            }
            totalArray = totalArray.reduce(function (a, b) {
                return a.concat(b)
            })
            totalArray = [... new Set(totalArray)]

            let tempObj = {}
            for (let i = 0; i < totalArray.length; i++) {
                tempObj[totalArray[i]] = this.getRandomPrize(2, 10).toFixed(2)
            }
            return tempObj
        },
        init: function () {
            let that = this
            axios.get("https://xunacooking.leanapp.cn/api").then(function (res) {
                // 定义食材价格表
                let priceTable = that.priceMaker(res.data.list)
                res.data.list.map(function (item, index, array) {
                    item.isClicked = false
                    for (let i = 0; i < item.ellipsis.length; i++) {
                        item.ellipsis[i] = {
                            name: item.ellipsis[i],
                            singlePrice: Number(priceTable[item.ellipsis[i]]),
                            isCanceled: false
                        }
                    }
                })
                that.food = res.data.list
            })
        }
    }
})