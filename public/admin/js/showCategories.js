
document.addEventListener('DOMContentLoaded', () => {
    const editCategoryButton = document.querySelectorAll('.edit-category')
    let selectedSubCategory
    const categoryNameInput = document.getElementById('category-name')
    const addCollection = document.querySelector('.add-collection')
    const addSubCategory = document.querySelector('.add-sub')
    const addCollContainer = document.querySelector('.coll-add')
    const newCollectionInput = document.querySelector('.new-collection')
    const editCategoryNameButton = document.querySelector('.edit-category-name')
    const saveButton = document.querySelector('.save')
    console.log(saveButton)


    function removeError(element, changingValue) {
        setTimeout(() => {
            element.style.display = 'none'
            // element.textContent = changingValue
        }, 2000);
        return
    }
    const messageFunction = (elem, message, error) => {
        console.log(elem, message, error)
        elem.textContent = message
        elem.style.display = 'block'
        if (error) {
            elem.style.color = 'red'
            removeError(elem)
            return
        }
        elem.style.color = 'green'
        removeError(elem)
    }
    saveButton.addEventListener('click', () => {
        const message = document.querySelector('.message')
        document.querySelector('.category-edit-container').style.display = 'none'
        messageFunction(message, 'Changes have been saved.', false)
    })





    editCategoryButton.forEach(button => {
        button.addEventListener('click', async (event) => {
            // console.log(event.target)
            document.querySelector('.category-edit-container').style.display = 'flex'
            const categoryId = event.target.dataset.id
            // console.log('id', categoryId)
            const response = await axios.get(`/admin/api/categorySelect/${encodeURIComponent(categoryId)}`)
            const data = await response.data
            const subCatList = document.querySelector('.sub-categories')
            const collectionList = document.querySelector('.collections')
            const output = document.querySelector('.coll-error')




            const editCollection = () => {
                const editCollectionButtons = document.querySelectorAll('.edit-collection')
                console.log('--------------------------------------', editCollectionButtons)
                editCollectionButtons.forEach(button => {
                    // console.log('button value--------------------',button.value)
                    button.addEventListener('click', async () => {
                        const inputValue = document.querySelector(`.coll-input-${button.value}`).value
                        const response = await axios.put(`/admin/api/editCollectionName/${encodeURIComponent(button.value)}/${inputValue}`)
                        const data = response.data
                        if (!data.error) {
                            return messageFunction(output, data.message, data.error)
                        }
                        return messageFunction(output, data.message, data.error)
                    })
                })
            }

            const deleteCollection = () => {
                const deleteCollectionButton = document.querySelectorAll('.delete-collection')
                // console.log('this is same as above', deleteCollectionButton)
                deleteCollectionButton.forEach(collection => {
                    collection.addEventListener('click', async () => {
                        const collections = document.querySelectorAll('.collection')
                        // console.log('length of collectin list ', collections.length)
                        if (collections.length > 1) {
                            // console.log('reached delete function')
                            const collectionId = collection.value
                            // console.log('this is the id of the collection wihich is going to delete', collectionId)
                            const response = await axios.delete(`/admin/api/deleteCollection/${encodeURIComponent(collectionId)}`)
                            const data = await response.data
                            // console.log(`.${collectionId}`)
                            if (!data.error) {
                                const deletedCollection = document.querySelector(`._${collectionId}`)
                                // console.log('element', deletedCollection)
                                collectionList.removeChild(deletedCollection)
                                messageFunction(output, data.message, data.error)
                            }
                            messageFunction(output, data.message, data.error)
                            return
                        }
                        messageFunction(output, `This is the last collection , you can't delete this `, true)
                    })
                })
            }

            const selectedSubCategoryFunction = () => {
                selectedSubCategory = document.querySelectorAll('input[name="sub"]')
                // console.log(selectedSubCategory)

                selectedSubCategory.forEach(subCategory => {
                    subCategory.addEventListener('change', async () => {
                        newCollectionInput.value = ''
                        // console.log(subCategory.value)
                        const subCategoryId = subCategory.value
                        const response = await axios.get(`/admin/api/changeSubCategory/${encodeURIComponent(subCategoryId)}`)
                        const data = await response.data
                        // console.log(data.collectionList)

                        if (data.foundData) {
                            collectionList.innerHTML = ''
                            data.collectionList.forEach(collection => {
                                const coll = `
                                <li value="${collection._id}" class="_${collection._id} collection">
                                <input type="text" class="coll-input-${collection._id}" value="${collection.name}">
                                <div class="df gap">
                                  <button class="edit-collection" value="${collection._id}" type="button">Edit</button>
                                  <button class="delete-collection" value="${collection._id}" type="button">Delete</button>
                                </div>
                              </li>
                                `
                                collectionList.innerHTML += coll
                                editCollection()
                                deleteCollection()

                            })
                            addCollection.value = subCategoryId

                        }
                        addCollContainer.style.display = 'flex'
                        // console.log('this is list of delete buttons', document.querySelectorAll('.delete-collection'))
                    })
                })
            }

            const editSubCats = () => {
                const editingSubCatButton = document.querySelectorAll('.edit-sub-name')
                editingSubCatButton.forEach(button => {
                    button.addEventListener('click', async () => {
                        const inputValue = document.querySelector(`.sub-input-${button.value}`).value
                        const response = await axios.put(`/admin/api/editSubCategoryName/${button.value}/${inputValue}`)
                        const data = response.data
                        if (!data.error) {
                            return messageFunction(output, data.message, data.error)
                        }
                        messageFunction(output, data.message, data.error)
                    })
                })
            }
            const deleteSubCats = () => {
                const deletingSubCatButtons = document.querySelectorAll('.delete-sub-name')
                deletingSubCatButtons.forEach(button => {
                    button.addEventListener('click', async () => {
                        const subCategoriesList = document.querySelectorAll('.sub-category')
                        if (subCategoriesList.length > 1) {
                            const response = await axios.delete(`/admin/api/deleteSubCat/${button.value}`)
                            const data = response.data
                            if (!data.error) {
                                const deletedSubCat = document.querySelector(`._${button.value}`)
                                subCatList.removeChild(deletedSubCat)
                                collectionList.innerHTML = ''
                                messageFunction(output, data.message, data.error)
                            }
                            return
                        }
                        messageFunction(output, `this is the last sub category , You can't delete `, true)
                    })
                })
            }



            // console.log('-----------------', data)
            if (!data.error) {
                // console.log('------------------------------------------', data.error)
                editCategoryNameButton.addEventListener('click', async () => {
                    const currentCategoryName = document.querySelector('#category-name').value
                    // console.log('this is the current category name ', currentCategoryName)
                    const response = await axios.post(`/admin/api/changeCategoryName/${encodeURIComponent(currentCategoryName)}`)
                    const data = response.data
                    if (!data.error) {
                        messageFunction(output, data.message, data.error)
                        return
                    }
                    messageFunction(output, data.message, data.error)
                })


                subCatList.innerHTML = ''
                addSubCategory.value = data.foundedCategory._id
                categoryNameInput.value = data.foundedCategory.name
                data.foundedSubCats.forEach(element => {
                    const SubCats = `
                    <li value="${element._id}" class="_${element._id} sub-category">
                    <div class="df jcc-and-aic">
                    <input type="radio" name="sub" id="collection-sub-category" value="${element._id}">
                    <input type="text" class="sub-input-${element._id}" value="${element.name}">
                    </div>
                    <div class="df gap">
                    <button class="edit-sub-name" value="${element._id}" type="button">Edit</button>
                    <button class="delete-sub-name" value="${element._id}" type="button">Delete</button>
                    </div>
                    </li>
                    `
                    subCatList.innerHTML += SubCats


                });
                addSubCategory.addEventListener('click', async () => {
                    const newSubName = document.querySelector('.new-sub-category').value
                    if (newSubName.length < 3) {
                        messageFunction(output, 'Sub category name should be atleast 3 characters', true)
                        return
                    }
                    try {
                        const response = await axios.post(`/admin/api/addSubCategory/${encodeURIComponent(newSubName)}`)
                        const data = response.data
                        if (!data.error) {
                            messageFunction(output, data.message, data.error)
                            const SubCats = `
                                <li value="${data.subCategoryId}" class="_${data.subCategoryId} sub-category">
                                <div class="df jcc-and-aic">
                                <input type="radio" name="sub" id="collection-sub-category" value="${data.subCategoryId}">
                                <input type="text" class="sub-input-${data.subCategoryId}" value="${newSubName.toUpperCase().trim()}">
                                </div>
                                <div class="df gap">
                                <button class="edit-sub-name" value="${data.subCategoryId}" type="button">Edit</button>
                                <button class="delete-sub-name" value="${data.subCategoryId}" type="button">Delete</button>
                                </div>
                                </li>
                                `
                            subCatList.innerHTML += SubCats
                            deleteSubCats()
                            editSubCats()
                            selectedSubCategoryFunction()
                            return
                        }
                        messageFunction(output, data.message, data.error)

                    } catch (err) {
                        console.log('error whiile adding sub category.')
                    }

                })


                deleteSubCats()
                editSubCats()
                selectedSubCategoryFunction()





                addCollection.addEventListener('click', async () => {
                    console.log('clicked add button')
                    const newCollectionName = document.getElementById('new-collection').value
                    console.log(newCollectionName)
                    if (newCollectionName.length < 2) {
                        messageFunction(output, 'collection name should be atleast 3 characters', true)
                    }
                    try {
                        const response = await axios.post(`/admin/api/createCollection/${encodeURIComponent(newCollectionName)}/${encodeURIComponent(addCollection.value)}`)
                        const data = response.data
                        console.log('this is response of the colleciton create api', data)
                        if (!data.error) {
                            messageFunction(output, data.message, data.error)
                            const coll = `
                                <li value="${data.collectionId}" class="_${data.collectionId} collection">
                                <input type="text" class="coll-input-${data.collectionId}" value="${newCollectionName.toUpperCase().trim()}">
                                <div class="df gap">
                                  <button class="edit-collection" value="${data.collectionId}" type="button">Edit</button>
                                  <button class="delete-collection" value="${data.collectionId}" type="button">Delete</button>
                                </div>
                              </li>
                                `
                            collectionList.innerHTML += coll
                            editCollection()
                            deleteCollection()
                            return
                        }
                        messageFunction(output, data.message, data.error)
                        console.log('calling delete function')
                        editCollection()
                        deleteCollection()
                    } catch (err) {
                        console.log('errro --------------------------', err.message)
                    }
                })




            }

            // console.log(data)

        })

    })





})