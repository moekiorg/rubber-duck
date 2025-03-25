class Test {
  insert() {
    const inserted = document.createElement('div')
    inserted.innerText = 'inserted'
    document.querySelector('body').appendChild(inserted)
  }
}

const test = new Test()
test.insert()
