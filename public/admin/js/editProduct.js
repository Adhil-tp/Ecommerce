
const mainImageChange = document.getElementById('mainImage')
const imagesChange = document.getElementById('detailedImage')
const imageList = document.querySelector('.image-list')

const productImages = document.querySelectorAll('.product-image')
const selectedImage = document.querySelector('.selected-image')

const categorySelect = document.getElementById('category')
const subCategorySelect = document.getElementById('sub-category')
const collectionSelect = document.getElementById('collection')

const imageButtonsContainer = document.querySelector('.img-buttons')

const multipleImageInput = document.querySelector('#detailedImage')


const saveChangesButton = document.querySelector('.save-changes-button')


let imgAdd = true

let mainImageChanged = false
let changingImageIndex

const images = {
    mainImage: undefined,
    newMainImage: undefined,
    detailedImages: [],
    newDetailedImages: [],
    deletedImages: []
}

const imageNodeList = document.querySelectorAll('.product-image')
for (let image of imageNodeList) {
    if (image.classList.contains('main-image')) {
        images.mainImage = image.dataset.imgurl
    } else {
        images.detailedImages.push(image.dataset.imgurl)
    }
}

const imageChangeCallbackFunction = (event) => {
    const files = event.target.files
    if (!imgAdd) {
        for (let file of files) {
            const newDetailedImages = images.newDetailedImages
            const foundDupImage = newDetailedImages.find((elem) => {
                elem?.name == file.name
            })
            if (!images.detailedImages.includes(file) || !foundDupImage) {
                const imageList = document.querySelector('.image-list')
                images.newDetailedImages.push(file)
                const specificImageURL = URL.createObjectURL(file)
                const selectedImageFromList = document.querySelector('.preview-image')
                const selectedImageURLFromList = document.querySelector('.preview-image').dataset.imgurl
                const indexOfImageToDelete = images.detailedImages.findIndex((elem) => {
                    console.log(elem == selectedImageURLFromList)
                    return elem == selectedImageURLFromList
                })
                console.log('index to delete', indexOfImageToDelete)
                images.deletedImages.push(images.detailedImages[indexOfImageToDelete])
                images.detailedImages.splice(indexOfImageToDelete, 1)
                selectedImageFromList.src = specificImageURL
                selectedImageFromList.dataset.imgurl = `${file.name}`
                selectedImage.src = specificImageURL
            }
        }
    } else {
        for (let file of files) {
            console.log(files.length)
            images.newDetailedImages.push(file)
            const addedImgURL = URL.createObjectURL(file)
            imageList.innerHTML += `<img src="${addedImgURL}" class="product-image preview-image"
            data-imgURL="${addedImgURL}" alt="">`
            productImgClickFunction()
        }
    }

    console.log(images)
    imagesChange.removeEventListener("change", imageChangeCallbackFunction)
}

console.log('images', images)

const imageChangeFunction = () => {
    const imagesChange = document.getElementById('detailedImage')
    imagesChange.addEventListener('change', imageChangeCallbackFunction)
}

const productImgClickFunction = () => {
    const productImages = document.querySelectorAll('.product-image')
    productImages.forEach(image => {
        image.addEventListener('click', (event) => {

            selectedImage.src = image.src
            // console.log('selected image ' ,event.target.dataset.imgurl)
            for (let image of productImages) {
                image.classList.remove('preview-image')
            }
            image.classList.add('preview-image')
            // productImages[prieviewImageIndex].classList.remove('preview-image')
            if (!image.classList.contains('main-image')) {
                imageButtonsContainer.innerHTML = `
                <button value="${image.dataset.imgurl}" class="change-image">Change</button>
                <button value="${image.dataset.imgurl}" class="delete-image">Delete</button>
                `
                document.querySelector('.add-img-container').innerHTML = `<button class="add-img">Add image</button>`
                changeImagesFunction()
                addImageFunction()
                return
            }
            document.querySelector('.add-img-container').innerHTML = ''
            imageButtonsContainer.innerHTML = `<button value="${image.dataset.imgurl}" class="change-main-image">Change</button>`
            changeMainImageFunction()
        })
    })
}

const changeMainImageFunction = () => {
    const changeMainImage = document.querySelector('.change-main-image')
    changeMainImage.addEventListener('click', () => {
        mainImageChange.click()
    })
}
const changeImagesFunction = () => {
    const changeImage = document.querySelectorAll('.change-image')
    const deleteImage = document.querySelectorAll('.delete-image')

    changeImage.forEach(button => {
        button.addEventListener('click', () => {
            imagesChange.click()
            imgAdd = false
        })
    })
    imageChangeFunction()


    deleteImage.forEach(button => {
        button.addEventListener('click', () => {
            const imageList = document.querySelector('.image-list')
            const childNodes = imageList.children
            const deletingImageFromList = document.querySelector('.preview-image')
            const deletingImageURLFromList = document.querySelector('.preview-image').dataset.imgurl
            const nodeListArray = Array.from(childNodes)
            const index = nodeListArray.indexOf(deletingImageFromList)
            imageList.removeChild(deletingImageFromList)
            selectedImage.src = childNodes[index - 1].src
            childNodes[index - 1].classList.add('preview-image')
            images.detailedImages.forEach((elem, index, array) => {
                if (elem == deletingImageURLFromList) {
                    images.deletedImages.push(elem)
                    array.splice(index, 1)
                }
            })
            console.log(images)
        })
    })
}
changeMainImageFunction()
// changeImagesFunction()


mainImageChange.addEventListener('change', () => {
    console.log(mainImageChange.files)
    const file = mainImageChange.files[0]
    const mainImageURL = URL.createObjectURL(file)
    console.log(mainImageURL)
    selectedImage.src = mainImageURL
    images.mainImage = null
    images.newMainImage = file
    console.log('images after changing main images ', images)
    productImages[0].src = mainImageURL
    mainImageChanged = true
})


const addImageFunction = () => {
    const addImageButton = document.querySelector('.add-img')
    addImageButton.addEventListener('click', () => {
        imagesChange.click()
        imgAdd = true
    })
}


let prieviewImageIndex


productImgClickFunction()


categorySelect.addEventListener('change', () => {
    console.log(category.value)
    axios.get(`/admin/api/categorySelect/${encodeURIComponent(category.value)}`)
        .then(response => {
            const data = response.data
            console.log(data)
            if (!data.error) {
                const foundedSubCats = data.foundedSubCats
                subCategorySelect.innerHTML = ''
                foundedSubCats.forEach(element => {
                    const subCat = document.createElement('option')
                    subCat.value = element._id
                    subCat.textContent = element.name
                    subCategorySelect.appendChild(subCat)
                })
                const foundedCollections = data.foundedCollections
                collectionSelect.innerHTML = ''
                console.log(foundedCollections)
                foundedCollections.forEach(element => {
                    const coll = document.createElement('option')
                    coll.value = element._id
                    coll.textContent = element.name
                    collectionSelect.appendChild(coll)
                })
            }
        }).catch(err => {
            console.log('something went wrong while chosing category')
        })
})


subCategorySelect.addEventListener('change', () => {
    console.log(subCategorySelect.value)
    axios.get(`/admin/api/subCategorySelect/${encodeURIComponent(subCategorySelect.value)}`)
        .then(response => {
            const data = response.data
            if (!data.error) {
                const foundedSubCategories = data.foundedSubCategories
                collectionSelect.innerHTML = ''
                foundedSubCategories.forEach(element => {
                    const coll = document.createElement('option')
                    coll.value = element._id
                    coll.textContent = element.name
                    collectionSelect.appendChild(coll)
                })
            }
        })
        .catch(err => {
            console.log('somethig happened while chosing sub ')
        })
})


function removeError(element, changingValue) {
    setTimeout(() => {
        element.style.display = 'none'
        element.textContent = changingValue
    }, 1500);
    return
}


saveChangesButton.addEventListener('click', async (event) => {
    event.preventDefault()
    const nameValue = document.querySelector('#name').value
    const description = document.querySelector('#description').value
    const category = document.getElementById('category').value
    const subCategory = document.getElementById('sub-category').value
    const collection = document.getElementById('collection').value
    let mainImage


    let detailedImage = document.querySelector('#detailedImage').files

    const color = document.querySelector('#color').value
    const size = document.querySelector('#size').value
    const delWithin = document.querySelector('#del-within').value
    let stock = document.querySelector('#stock').value
    let price = document.querySelector('#price').value
    let offerPrice = document.querySelector('#offer-price').value



    const emptyFormError = document.querySelector('.empty-form-error')


    const nameError = document.querySelector('.name-empty')
    const descError = document.querySelector('.desc-empty')
    // const imageError = document.querySelector('.image-empty')
    // const mulImagesError = document.querySelector('.multiple-img-empty')
    const stockError = document.querySelector('.stock-empty')
    const priceError = document.querySelector('.price-empty')
    const offerPriceError = document.querySelector('.offer-price-empty')

    const errors = {
        nameError: false,
        descError: false,
        mainImageError: false,
        multipleImageError: false,
        priceError: false,
        stockError: false,
        colorError: false,
        delWithinError: false
    }

    emptyFormError.style.display = 'none'

    console.log('this is the final data ', images)


    if (!images.mainImage && images.detailedImages.length == 0 && !nameValue && !description && !stock && !price && !offerPrice) {
        emptyFormError.style.display = 'block'
        return removeError(emptyFormError)
    }


    //name validation
    if (nameValue == '') {
        nameError.style.display = 'block'
        removeError(nameError)
        errors.nameError = true
    } else if (nameValue.length < 3) {
        nameError.textContent = 'name must be atleast 3 letters'
        nameError.style.display = 'block'
        removeError(nameError, 'Name is required')
        errors.nameError = true
    }
    console.log('passed name area')
    //desc validation 

    if (description == '') {
        descError.style.display = 'block'
        removeError(descError)
        errors.descError = true
    } else if (description.length < 20) {
        descError.style.display = 'block'
        descError.textContent = 'brief description required'
        removeError(descError, 'Description is required')
        errors.descError = true
    }

    console.log('passed desc area')

    //main image validation 

    // console.log(images)

    if (!images.mainImage && !images.newMainImage) {
        console.log('reached image error')
        emptyFormError.style.display = 'block'
        emptyFormError.textContent = 'Main image is must and 3 more additional images are mandatory'
        removeError(emptyFormError, 'Fill every fields')
        errors.mainImageError = true
    }

    //multiple image error  validation

    if (images.detailedImages.length + images.newDetailedImages.length < 3) {
        emptyFormError.style.display = 'block'
        emptyFormError.textContent = 'Main image is must and 3 more additional images are mandatory'
        removeError(emptyFormError, 'Fill every fields')
        errors.multipleImageError = true
    }

    //stock validation

    stock = +stock

    if (!stock) {
        stockError.style.display = 'block'
        const defaultError = stockError.textContent
        stockError.textContent = 'Enter a valid stock number'
        removeError(stockError, defaultError)
        errors.stockError = true
    }

    // price validation 
    // console.log( +price)
    price = +price
    if (!price) {
        console.log('price', typeof price)
        console.log('displaying error')
        // console.log('ater price', typeof price)
        const defaultError = priceError.textContent
        priceError.style.display = 'block'
        priceError.textContent = 'Enter a valid number'
        removeError(priceError, defaultError)
        errors.priceError = true
    }

    offerPrice = +offerPrice

    if (!offerPrice) {
        if (offerPrice != 0) {
            console.log('displaying ofr error')
            offerPriceError.style.display = 'block'
            removeError(offerPriceError, offerPriceError.textContent)
        }
    }

    //del within validation

    if (!delWithin) {
        errors.delWithinError = true
    }

    if (errors.nameError
        || errors.descError
        || errors.mainImageError
        || errors.multipleImageError
        || errors.priceError
        || errors.stockError
    ) {
        console.log('error occured')
        console.log(errors)
        return
    }

    const formData = new FormData()

    // console.log('main image ', mainImage)
    // console.log('detailed image ', detailedImage)


    const productDetails = {
        name: nameValue,
        description: description,
        category,
        subCategory,
        collection,
        price,
        offerPrice,
        stock,
        color,
        size,
        deliveryWithin: delWithin
    }

    const productDetailsArray = Object.entries(productDetails)
    productDetailsArray.forEach(elem => {
        formData.append(elem[0], elem[1])
    })


    if (images.mainImage) {
        formData.append('productImage', images.mainImage)
    } else if (images.newMainImage) {
        formData.append('productImage', images.newMainImage)
    }
    images.detailedImages.forEach(elem => {
        formData.append('detailedImages', elem)
    })
    images.deletedImages.forEach(elem => {
        formData.append('deletedImages', elem)
    })
    images.newDetailedImages.forEach(elem => {
        formData.append('newDetailedImages', elem)
    })

    console.log('form data ', formData)

    const response = await axios.put('/admin/api/updateProduct', formData, {
        headers: {
            'Content-type': 'multipart/form-data'
        }
    })
    console.log(response.data)
    const data = response.data
    if (data.error) {
        
        if (data.errorObj.nameError) {
            nameError.style.display = 'block'
            removeError(nameError, nameError.textContent)
        }
        if (data.errorObj.descError) {
            descError.style.display = 'block'
            removeError(descError, descError.textContent)
        }
        // if (data.errorObj.imagesError) {
        //     mulImagesError.style.display = 'block'
        //     removeError(mulImagesError, imageError.textContent)
        // }
        if (data.errorObj.stockError) {
            stockError.style.display = 'block'
            removeError(stockError, stockError.textContent)
        }
        if (data.errorObj.priceError) {
            console.log('reached price in server')
            const defaultError = priceError.textContent
            priceError.style.display = 'block'
            priceError.textContent = data.errorObj.priceError
            removeError(priceError, defaultError)
        }
        return
    }
    window.location.href = '/admin/showProducts'


})