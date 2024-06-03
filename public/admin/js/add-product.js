




const dataObject = {
    categoryName: '',
    categoryId: '',
    subCategories: [],
    collections: []
}

let isDataSaved = false
let isCatAdded = isSubAdded = isCollAdded = false


//add category

const productForm = document.querySelector('.form')
const submitCategory = document.querySelector('.submit-category')
const showSelected = document.querySelector('.show-selected')
const detailedImage = document.getElementById('detailedImage');
const fileList = document.getElementById('fileList');
const mainImageList = document.querySelector('.main-image-name')
const showDetailedSelected = document.querySelector('.show-detailed-selected')
const mainImageName = document.getElementById('mainImage')
const showCategoryForm = document.querySelector('.add-category-form')
const closeAddCategory = document.querySelector('.close-add-category')
const addCategoryForm = document.querySelector('.pop')
const addCategory = document.querySelector('.add-category')
const categoryError = document.querySelector('.category-error')
const categoryAddForm = document.querySelector('.add-popup')

const subCategoryInput = document.querySelector('#sub-category-name')
const addSubcategory = document.querySelector('.add-sub-category')

const collectionNameInput = document.getElementById('collection-name-input')
const collectionField = document.querySelector('.collection-field')
const collectionList = document.querySelector('.collection-list')
const collectionParentSelect = document.querySelector('#collection-parent-option')

const addCollection = document.querySelector('.add-collection')


const catFormCloseConfirmation = document.querySelector('.cat-form-close')
const catFormCloseNo = document.querySelector('.cat-close-no')
const catFormCloseYes = document.querySelector('.cat-close-yes')

const output = document.querySelector('.output')



//add product

const addProduct = document.querySelector('.add-product-button')
const categorySelect = document.getElementById('category')
const subCategorySelect = document.getElementById('sub-category')
const collectionSelect = document.getElementById('collection')



//this is to make the subcategory and collections to set disabled 
subCategoryInput.disabled = true
collectionNameInput.disabled = true
collectionParentSelect.disabled = true




//functions
//-------------------------------------------------------------------------------------------------------------------------------------

const deleteEverything = () => {
    axios.post('/admin/api/deleteUnsavedCategory', dataObject)
        .then(response => {
            const data = response.data
            if (!data.error) {
                addCategoryForm.style.display = 'none'
                catFormCloseConfirmation.style.display = 'none'
            }
        })
}

const isDataSavedCheck = () => {
    if (!isDataSaved) {
        return deleteEverything()
    }
}

//-------------------------------------------------------------------------------------------------------------------------------------




//----------------------------------------------------------------------------------------------------------------------------------
// this is the functionality of the add subcategory button 
const subCategoryArea = document.querySelector('.sub-category-area')
const subCategoryNameError = document.querySelector('.sub-cat-name-error')


submitCategory.addEventListener('click', (event) => {
    event.preventDefault()
    if (isCatAdded && isSubAdded && isCollAdded) {
        console.log('reached closing area')

        addCategoryForm.style.display = 'none'
        isDataSaved = true
        const category = document.getElementById('category')
        const categoryOption = document.createElement('option')
        categoryOption.textContent = dataObject.categoryName.toUpperCase()
        categoryOption.value = dataObject.categoryId
        category.appendChild(categoryOption)
        return
    }

    console.log('reached warning area')
    output.textContent = 'add every fields'
    output.style.display = 'flex'
    output.style.color = 'red'
    addCategoryForm.style.display = 'flex'
    setTimeout(() => {
        output.textContent = ''
        output.style.color = 'green'
    }, 1500);
})



//add category-------------------------------------------------------------------------------------------------------------------
//this event listener will do the funcitonalities to add a category into the categories collection
addCategory.addEventListener('click', async (event) => {
    event.preventDefault()
    const categoryInput = document.getElementById('category-name')
    const categoryName = document.getElementById('category-name').value
    const emptyFormError = document.querySelector('.empty-form-error')
    console.log('button action is ', addCategory.dataset.action)
    if (addCategory.dataset.action == 'edit') {
        console.log('reaching editing context')
        axios.post(`/admin/api/changeCategoryName/${encodeURIComponent(categoryName)}`)
            .then(response => {
                const data = response.data
                if (data.error) {
                    console.log('Here')
                    categoryError.style.display = 'block'
                    categoryError.textContent = data.message
                    addCategoryForm.style.display = 'flex'
                    setTimeout(() => {
                        categoryError.style.display = 'none'
                        categoryError.textContent = ''
                    }, 1500);
                    return
                } else if (!data.error) {
                    output.textContent = data.message
                    output.style.display = 'block'
                    subCategoryInput.disabled = false
                    // categoryInput.disabled = true
                    addCategory.dataset.action = 'edit'
                    addCategory.textContent = 'Edit'
                    dataObject.categoryName = categoryName
                    setTimeout(() => {
                        output.style.display = 'none'
                    }, 2000)

                    dataObject.categoryId = data.categoryId
                    console.log('dataObject category id ', dataObject)
                    return
                }
            }).catch(err => {
                console.log('happened something at the time of category name change')
            })
        return
    }
    console.log('reached creating area')
    categoryError.textContent = ''
    console.log(categoryName)
    if (categoryName.length < 3) {
        console.log('ctg error')
        event.preventDefault()
        categoryError.style.display = 'block'
        categoryError.textContent = 'name must contain atleast 3 characters'
        return
    }

    const url = `/admin/api/createCategory/${encodeURIComponent(categoryName)}`
    console.log('api url ', url)
    try {
        const result = await fetch(url, { method: "POST" })
        //this api will return a object with two fields (error and message)
        //if error is true , it means there is a error occured at the time of category addition 
        //if error is false , it indicated there is no error and the category is created succesfully 
        const data = await result.json()
        console.log('response data', data.error)
        if (data.error) {
            console.log('Here')
            categoryError.style.display = 'block'
            categoryError.textContent = data.message
            addCategoryForm.style.display = 'flex'
        } else if (!data.error) {
            output.textContent = data.message
            output.style.display = 'block'
            isCatAdded = true
            console.log(isCatAdded, isSubAdded, isCollAdded)
            subCategoryInput.disabled = false
            dataObject.categoryName = categoryName
            addCategory.dataset.action = 'edit'
            addCategory.textContent = 'Edit'
            setTimeout(() => {
                output.style.display = 'none'
            }, 2000)

            dataObject.categoryId = data.categoryId
            console.log('dataObject category id ', dataObject)
        }
    } catch (err) {
        console.log('error creating category', err.message)
    }
})

//this event is handling the creation of the sub categories inside the new category
addSubcategory.addEventListener('click', (event) => {
    event.preventDefault()
    const subCategoryInput = document.querySelector('#sub-category-name')
    const subCategoryValue = document.querySelector('#sub-category-name').value
    if (subCategoryInput.disabled) {
        subCategoryNameError.textContent = 'create a category first'
        setTimeout(() => {
            subCategoryNameError.textContent = ''
        }, 1500)
        return
    }
    if (subCategoryValue.length < 3) {
        subCategoryNameError.textContent = 'name should be atleast 3 characters'
        return
    }
    //this api will create  a sub category if there is no sub category with the name given

    axios.post(`/admin/api/addSubCategory/${encodeURIComponent(subCategoryValue)}`)
        .then(response => {
            const data = response.data
            console.log('response ', data)
            if (data.error) {
                console.log('response object when no error')
                output.textContent = data.message
                output.style.display = 'block'
                output.style.color = 'red'
                setTimeout(() => {
                    output.textContent = ''
                    output.style.display = 'none'
                    output.style.color = 'green'
                }, 1500);
                return
            }
            console.log('response object when no error', data.message)
            output.textContent = data.message
            output.style.display = 'block'
            setTimeout(() => {
                output.textContent = ''
            }, 1500)
            isSubAdded = true
            const subCategoryList = document.querySelector('.sub-category-list')
            const newSubCat = document.createElement('li')
            newSubCat.dataset.value = data.subCategoryId
            newSubCat.classList = 'sub-category'
            newSubCat.textContent = subCategoryValue
            subCategoryInput.value = ''
            subCategoryList.appendChild(newSubCat)
            collectionField.disabled = false

            dataObject.subCategories.push(data.subCategoryId)
            console.log('dataObject ', dataObject)

            const collectionParent = document.createElement('option')
            collectionParent.text = subCategoryValue
            collectionParent.value = data.subCategoryId
            console.log('sub is ', collectionParent.value)
            collectionParentSelect.appendChild(collectionParent)

            collectionNameInput.disabled = false
            collectionParentSelect.disabled = false

            const defaultCollection = document.querySelector('.collection-default-option')
            collectionParentSelect.removeChild(defaultCollection)
            console.log('making enable')
        })
})


//this function will create a collection
addCollection.addEventListener('click', (event) => {
    event.preventDefault()
    console.log('thenggaa')
    const collectionNameInput = document.querySelector('#collection-name-input').value
    const collectionNameField = document.querySelector('#collection-name-input')
    console.log('this is value', collectionNameInput)
    const collectionError = document.querySelector('.collection-error')
    if (collectionNameInput.length < 3) {
        // console.log('value of subcategory ', choosenSubCategry)
        collectionError.style.display = 'block'
        collectionError.textContent = 'field should be atleast 3 characters'
        setTimeout(() => {
            collectionError.style.display = 'none'
            collectionError.textContent = ''
        }, 1500);
        return collectionError.textContent = 'Enter atleast 3 characters'
    }

    const choosenSubCategry = document.querySelector('#collection-parent-option').value
    axios.post(`/admin/api/createCollection/${encodeURIComponent(collectionNameInput)}/${encodeURIComponent(choosenSubCategry)}`)
        .then(response => {
            const data = response.data
            if (data.error) {
                output.textContent = data.message
                output.style.color = 'red'
                output.style.display = 'block'
                setTimeout(() => {
                    output.textContent = ''
                    output.style.display = 'none'
                }, 1500);
                return
            }
            isCollAdded = true
            const collectionListItem = document.createElement('li')
            collectionListItem.textContent = collectionNameInput
            collectionListItem.classList = 'collection'
            collectionList.appendChild(collectionListItem)
            collectionNameField.value = ''
            output.textContent = data.message
            output.style.color = 'green'
            output.style.display = 'block'
            setTimeout(() => {
                output.textContent = ''
                output.style.display = 'none'
            }, 1500);

            console.log(data)
            console.log('this is data collection id ', data.collectionId)

            dataObject.collections.push(data.collectionId)

            console.log('created nothing')
        }).catch(err => { console.log('some error occured while creation of new collection', err.message) })
})


//this api will change the parent sub category of collection we are adding  
collectionParentSelect.addEventListener('change', () => {
    const collectionList = document.querySelector('.collection-list')
    collectionList.innerHTML = ''
    const chosenCollectionParent = document.getElementById('collection-parent-option').value
    console.log('this is the id sending to change category api', chosenCollectionParent)
    axios.get(`/admin/api/changeSubCategory/${encodeURIComponent(chosenCollectionParent)}`)
        .then(response => {
            const data = response.data
            console.log('this is the data got from the change category api', data)
            if (data.foundData) {
                console.log('type of founded data', data.collectionList)
                data.collectionList.forEach(element => {
                    const newList = document.createElement('li')
                    newList.classList = 'category'
                    newList.textContent = element.name
                    collectionList.appendChild(newList)
                });
            }
        }).catch(err => {
            console.log('err', err.message)
        })
})



// -------------------------------------------------------------------------------------------------------------------------------


function removeError(element, changingValue) {
    setTimeout(() => {
        element.style.display = 'none'
        element.textContent = changingValue
    }, 1500);
    return
}


const images = {
    mainImage: undefined,
    images: []
}

addProduct.addEventListener('click', async (event) => {
    event.preventDefault()
    const nameValue = document.querySelector('.input').value
    const description = document.querySelector('.description').value
    const category = document.getElementById('category').value
    const subCategory = document.getElementById('sub-category').value
    const collection = document.getElementById('collection').value
    const mainImage = document.querySelector('#mainImage').files
    const detailedImage = document.querySelector('#detailedImage').files
    const color = document.querySelector('#color').value
    const size = document.querySelector('#size').value
    const delWithin  = document.querySelector('#del-within').value
    let stock = document.querySelector('#stock').value
    let price = document.querySelector('#price').value
    let offerPrice = document.querySelector('#offer-price').value



    const emptyFormError = document.querySelector('.empty-form-error')


    const nameError = document.querySelector('.name-empty')
    const descError = document.querySelector('.desc-empty')
    const imageError = document.querySelector('.image-empty')
    const mulImagesError = document.querySelector('.multiple-img-empty')
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
        delWithinError : false
    }

    emptyFormError.style.display = 'none'


    if (mainImage.length == 0 && detailedImage.length == 0 && !nameValue && !description && !stock && !price && !offerPrice) {
        emptyFormError.style.display = 'block'
        return removeError(emptyFormError)
    }


    //name validation
    if (nameValue == '') {
        nameError.style.display = 'block'
        // console.log('name error')
        removeError(nameError)
        errors.nameError = true
    } else if (nameValue.length < 3) {
        nameError.textContent = 'name must be atleast 3 letters'
        nameError.style.display = 'block'
        removeError(nameError, 'Name is required')
        errors.nameError = true
    }

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


    //main image validation 

    // console.log(images)

    if (!images.mainImage) {
        console.log('reached image error')
        imageError.style.display = 'block'
        removeError(imageError, imageError.textContent)
        errors.mainImageError = true
    }

    //multiple image error  validation

    if (images.images.length < 3) {
        mulImagesError.style.display = 'block'
        console.log('error when showing mul image error')
        removeError(mulImagesError, mulImagesError.textContent)
        errors.multipleImageError = true
    }

    //stock validation

    stock = +stock

    if(!stock){
        stockError.style.display  = 'block'
        const defaultError = stockError.textContent
        stockError.textContent = 'Enter a valid stock number'
        removeError(stockError , defaultError)
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

    if(!offerPrice){
        if(offerPrice != 0){
            console.log('displaying ofr error')
            offerPriceError.style.display = 'block'
            removeError(offerPriceError , offerPriceError.textContent)
        }
    }

    //del within validation

    if(!delWithin){
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

    console.log('main image ', mainImage)
    console.log('detailed image ', detailedImage)


    const productDetails = {
        name: nameValue,
        description: description,
        category,
        subCategory,
        collection,
        price,
        offerPrice,
        stock,
        color ,
        size,
        deliveryWithin : delWithin
    }

    const productDetailsArray = Object.entries(productDetails)
    productDetailsArray.forEach(elem => {
        formData.append(elem[0], elem[1])
    })

    formData.append('productImage', images.mainImage)
    images.images.forEach(elem => {
        formData.append('detailedImages', elem)
    })

    console.log(formData)

    const response = await axios.post('/admin/api/addProduct', formData, {
        headers: {
            'Content-type': 'multipart/form-data'
        }
    })
    console.log(response.data)
    const data = response.data
    if (data.error) {
        if (data.errorObj.emptyImage) {
            imageError.style.display = 'block'
            imageError.textContent = data.errorObj.emptyImage
            removeError(imageError, imageError.textContent)
        }
        if (data.errorObj.nameError) {
            nameError.style.display = 'block'
            removeError(nameError, nameError.textContent)
        }
        if (data.errorObj.descError) {
            descError.style.display = 'block'
            removeError(descError, descError.textContent)
        }
        if (data.errorObj.imagesError) {
            mulImagesError.style.display = 'block'
            removeError(mulImagesError, imageError.textContent)
        }
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

    
    
    // Array.from(productForm.elements).forEach(elem => {
    //     if(elem.tagName != 'SELECT'){
    //         console.log(elem)
    //         elem.value = ''
    //     }
    //     if(input['type']==file){
    //         input.files
    //     }
    // })
    console.log('images' , mainImage)
    console.log('images' , detailedImage)
    images.mainImage = null
    images.images = []
    fileList.textContent = ''
    mainImageList.innerHTML = ''
    productForm.reset()


})

// sub choosing category 
//----------------------------------------------------------------------------------------------------------------------------



showCategoryForm.addEventListener('click', (event) => {
    event.preventDefault()
    isCatAdded = isSubAdded = isCollAdded = false
    addCategory.dataset.action = 'add'
    addCategory.textContent = 'Add'
    addCategory.disabled = false
    const categoryInput = document.getElementById('category-name')
    categoryInput.disabled = false
    collectionParentSelect.disabled = true
    collectionParentSelect.innerHTML = ''
    isDataSaved = false
    categoryError.style.display = 'none'
    document.getElementById('category-name').value = ''
    addCategoryForm.style.display = 'flex'

    subCategoryInput.disabled = true
    collectionNameInput.disabled = true
})


// ------------------------------------------------------------------------------------------------------------------------------------
closeAddCategory.addEventListener('click', () => {
    if (isCatAdded || isSubAdded || isCollAdded) {
        catFormCloseConfirmation.style.display = 'flex'
        categoryAddForm.disabled = true
        Array.from(categoryAddForm.elements).forEach(element => {
            element.disabled = true
        })
        return
    }
    addCategoryForm.style.display = 'none'
})

catFormCloseNo.addEventListener('click', () => {
    catFormCloseConfirmation.style.display = 'none'
    categoryAddForm.disabled = true
    Array.from(categoryAddForm.elements).forEach(element => {
        element.disabled = false
    })
})



catFormCloseYes.addEventListener('click', isDataSavedCheck)

console.log('eheell')





showSelected.addEventListener('click', (event) => {
    return mainImageName.click()
})
mainImageName.addEventListener('change', (event) => {
    const files = event.target.files
    console.log(files)
    document.querySelector('.main-image-name').textContent = files[0].name
    images.mainImage = files[0]
})
showDetailedSelected.addEventListener('click', (event) => {
    return detailedImage.click()
})
detailedImage.addEventListener('change', (event) => {
    const files = event.target.files;
    console.log('this is files in ', files[0])

    // Iterate through selected files and create list items
    for (const file of files) {
        const listItem = document.createElement('li');
        listItem.classList = 'selected-images'
        listItem.textContent = file.name;
        fileList.appendChild(listItem);
        images.images.push(file)
        // console.log('these are images ', images.images)
    }
});




//! this is collection hovering action   
collectionField.addEventListener('mouseenter', () => {
    if (!subCategoryInput.disabled) {
        collectionList.style.display = 'block'
    }
})

collectionField.addEventListener('mouseleave', () => {
    collectionList.style.display = 'none'
})


//! this is subcategory hovering action   
subCategoryArea.addEventListener('mouseenter', () => {
    if (!subCategoryInput.disabled) {
        const subCategoryList = document.querySelector('.sub-category-list')
        subCategoryList.style.display = 'block'
    }
})
subCategoryArea.addEventListener('mouseleave', () => {
    const subCategoryList = document.querySelector('.sub-category-list')
    subCategoryList.style.display = 'none'
})

window.addEventListener('beforeunload', isDataSavedCheck)




// add products 

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