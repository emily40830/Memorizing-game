// Basic component //
const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",
}

const Symbols = [
  'https://image.flaticon.com/icons/svg/105/105223.svg', // 黑桃
  'https://image.flaticon.com/icons/svg/105/105220.svg', // 愛心
  'https://image.flaticon.com/icons/svg/105/105212.svg', // 方塊
  'https://image.flaticon.com/icons/svg/105/105219.svg' // 梅花
];

// View //
const view = {
  displayCards(indexes) {
    const rootElement = document.querySelector('#cards')
    //let htmlContent = Array.from(Array(52).keys()).map(index => this.getCardElement(index)).join("");
    let htmlContent = indexes.map(index => this.getCardElement(index)).join("");
    // for (let i = 0; i < 52; i++) {
    //   const card = this.getCardElement(i)
    //   htmlContent += card
    // }

    rootElement.innerHTML = htmlContent
  },
  getCardElement(index) {
    return `<div data-index="${index}" class="card back"></div>`
    //console.log(number)
    //console.log(paternIndex)

  },
  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1)
    const paternIndex = index % 4
    const cardInfo = `
        <p>${number}</p>
          <img src="${Symbols[paternIndex]}" alt="card">
        <p>${number}</p>
    `
    return cardInfo
  },
  flipCards(...cards) {
    //console.log(card)
    cards.map(card => {
      if (card.classList.contains('back')) {
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      }
      card.classList.add('back')
      card.innerHTML = null
    })
    // if (card.classList.contains('back')) {
    //   card.classList.remove('back');
    //   card.innerHTML = this.getCardContent(Number(card.dataset.index));
    //   return
    // }
    // card.classList.add('back')
    // card.innerHTML = null;
  },
  pairCards(...cards) {
    cards.map(card => { card.classList.add('paired') })
  },
  transformNumber(number) {
    switch (number) {
      case 1:
        return "A"
      case 11:
        return "J"
      case 12:
        return "Q"
      case 13:
        return "K"
      default:
        return number
    }
  },
  renderScore(score) {
    document.querySelector('.score').innerHTML = `Score: ${score}`;
  },
  renderTimes(times) {
    document.querySelector('.tried').innerHTML = `You've tried: ${times} times`;
  },
  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', event => event.target.classList.remove('wrong'), { once: true })
    })
  },
  showGameFinished() {
    const finishedContent = document.createElement('div')
    finishedContent.classList.add('completed')
    finishedContent.innerHTML =
      `
    <p>Complete!</p>
    <p>Score: <span>${model.score}</span> </p>
    <p>You've tried: <span>${model.triedTimes}</span> times</p>
    <button type="button" class="btn btn-style">Try again!</button>
    `
    const header = document.querySelector('#header')
    header.before(finishedContent)
  }
}

// Controller //
const controller = {
  currentState: GAME_STATE.FirstCardAwaits,
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },
  resetCards() {
    view.flipCards(...model.revealCards)
    //view.flipCard(model.revealCards[1])
    model.revealCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  },
  dispatchCardAction(card) { // 根據遊戲狀態分派不同的動作
    if (!card.classList.contains('back')) {
      return
    }
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        model.revealCards.push(card)
        break
      case GAME_STATE.SecondCardAwaits:
        view.renderTimes(++model.triedTimes)
        view.flipCards(card)
        model.revealCards.push(card)
        // 利用model.revealCards回傳的狀態是配對成功與否
        if (model.isRevealedCardsMatched()) {
          view.renderScore(model.score += 10)
          this.currentState = GAME_STATE.CardsMatched
          view.pairCards(...model.revealCards)
          //view.pairCard(model.revealCards[1])
          if (model.score === 260) {
            view.showGameFinished()
            this.currentState = GAME_STATE.GameFinished;
            return
          }
          model.revealCards = []
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          this.currentState = GAME_STATE.CardsMatchFailed
          view.appendWrongAnimation(...model.revealCards)
          setTimeout(this.resetCards, 1000)
        }
        break
    }
    console.log('this.currentState', this.currentState)
    console.log('revealCards', model.revealCards.map(card => card.dataset.index))
  }
}

// Model //
const model = {
  revealCards: [],
  isRevealedCardsMatched() { //判斷兩張牌是否是依樣的數字
    return this.revealCards[0].dataset.index % 13 === this.revealCards[1].dataset.index % 13
  },
  score: 0,
  triedTimes: 0
}

// Utility //
const utility = {
  // 洗牌演算法：Fisher-Yates Shuffle //
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())

    //1. 取出最後一張牌，index為count-1
    for (let index = number.length - 1; index > 0; index--) {
      //2. 取出後隨機找一張牌的位置
      let randomIndex = Math.floor(Math.random() * (index + 1));
      //3. 將兩張牌的位置對調
      [number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }

    return number
  }
}

controller.generateCards()

document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', e => {
    controller.dispatchCardAction(card)
  })
})

document.querySelector('.btn-style').addEventListener('click', e => {
  window.location.reload();
})