let images = document.querySelectorAll('img')
let avatar = document.querySelector('.avatar')

images.forEach(image => {
  image.addEventListener("click", () => {
    return avatar.value = image.src
  })
})
