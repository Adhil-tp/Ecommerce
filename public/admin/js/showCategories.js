
document.addEventListener('DOMContentLoaded', () => {
    const editCategoryButton = document.querySelectorAll('.edit-category')
    let selectedSubCategory
    const categoryNameInput = document.getElementById('category-name')
    const addCollection = document.querySelector('.add-collection')
    const addSubCategory = document.querySelector('.add-sub')
    const addCollContainer = document.querySelector('.coll-add')
    const newCollectionInput = document.querySelector('.new-collection')
    console.log(editCategoryButton)




    function removeError(element, changingValue) {
        setTimeout(() => {
            element.style.display = 'none'
            // element.textContent = changingValue
        }, 2000);
        return
    }

    editCategoryButton.forEach(button => {
        button.addEventListener('click', async (event) => {
            // console.log(event.target)
            document.querySelector('.category-edit-container').style.display = 'flex'
            const categoryId = event.target.dataset.id
            console.log('id', categoryId)
            const response = await axios.get(`/admin/api/categorySelect/${encodeURIComponent(categoryId)}`)
            const data = await response.data
            const subCatList = document.querySelector('.sub-categories')
            const collectionList = document.querySelector('.collections')
            const output = document.querySelector('.coll-error')


            const deleteCollection = () => {
                const deleteCollectionButton = document.querySelectorAll('.delete-collection')
                console.log('this is same as above', deleteCollectionButton)
                deleteCollectionButton.forEach(collection => {
                    collection.addEventListener('click', async () => {
                        console.log('reached delete function')
                        const collectionId = collection.value
                        console.log('this is the id of the collection wihich is going to delete', collectionId)
                        const response = await axios.delete(`/admin/api/deleteCollection/${encodeURIComponent(collectionId)}`)
                        const data = await response.data
                        console.log(`.${collectionId}`)
                        if (!data.error) {
                            const deletedCollection = document.querySelector(`._${collectionId}`)
                            console.log('element', deletedCollection)
                            collectionList.removeChild(deletedCollection)
                            output.style.display = 'block'
                            output.textContent = data.message
                            output.style.color = 'green'
                            return removeError(output)
                        }
                        output.style.display = 'block'
                        output.textContent = data.message
                        output.style.color = 'red'
                        removeError(output)
                    })
                })
            }

            const selectedSubCategoryFunction = () => {
                selectedSubCategory = document.querySelectorAll('input[name="sub"]')
                console.log(selectedSubCategory)

                selectedSubCategory.forEach(subCategory => {
                    subCategory.addEventListener('change', async () => {
                        newCollectionInput.value = ''
                        console.log(subCategory.value)
                        const subCategoryId = subCategory.value
                        const response = await axios.get(`/admin/api/changeSubCategory/${encodeURIComponent(subCategoryId)}`)
                        const data = await response.data
                        console.log(data.collectionList)

                        if (data.foundData) {
                            collectionList.innerHTML = ''
                            data.collectionList.forEach(collection => {
                                const coll = `
                                <li value="${collection._id}" class="_${collection._id}">
                                <input type="text" value="${collection.name}">
                                <div class="df gap">
                                  <button class="edit-collection" value="${collection._id}" type="button">Edit</button>
                                  <button class="delete-collection" value="${collection._id}" type="button">Delete</button>
                                </div>
                              </li>
                                `
                                collectionList.innerHTML += coll

                                deleteCollection()

                            })
                            addCollection.value = subCategoryId

                        }
                        addCollContainer.style.display = 'flex'
                        console.log('this is list of delete buttons', document.querySelectorAll('.delete-collection'))
                    })
                })
            }


            const deleteSubCats = () => {
                const deletingSubCatButtons = document.querySelectorAll('.delete-sub-name')
                deletingSubCatButtons.forEach(button => {
                    button.addEventListener('click', async () => {
                        const response = await axios.delete(`/admin/api/deleteSubCat/${button.value}`)
                        const data = response.data
                        if (!data.error) {
                            const deletedSubCat = document.querySelector(`._${button.value}`)
                            subCatList.removeChild(deletedSubCat)
                            collectionList.innerHTML = ''
                        }
                    })
                })
            }

            console.log(data)
            if (!data.error) {
                subCatList.innerHTML = ''
                addSubCategory.value = data.foundedCategory._id
                categoryNameInput.value = data.foundedCategory.name
                data.foundedSubCats.forEach(element => {
                    const SubCats = `
                    <li value="${element._id}" class="_${element._id}">
                    <div class="df jcc-and-aic">
                    <input type="radio" name="sub" id="collection-sub-category" value="${element._id}">
                    <input type="text" value="${element.name}">
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
                    if (newSubName.length < 2) {
                        output.style.display = 'block'
                        output.textContent = 'Sub category name should be atleast 3 characters'
                        output.style.color = 'red'
                        return removeError(output)
                    }
                    try {
                        const response = await axios.post(`/admin/api/addSubCategory/${encodeURIComponent(newSubName)}`)
                        const data = response.data
                        if (!data.error) {
                            output.textContent = data.message
                            output.style.display = 'block'
                            output.style.color = 'green'
                            removeError(output)
                            const SubCats = `
                                <li value="_${data.subCategoryId}">
                                <div class="df jcc-and-aic">
                                <input type="radio" name="sub" id="collection-sub-category" value="${data.subCategoryId}">
                                <input type="text" value="${newSubName.toUpperCase().trim()}">
                                </div>
                                <div class="df gap">
                                <button class="edit-sub-name" value="${data.subCategoryId}" type="button">Edit</button>
                                <button class="delete-sub-name" value="${data.subCategoryId}" type="button">Delete</button>
                                </div>
                                </li>
                                `
                            subCatList.innerHTML += SubCats
                            deleteSubCats()
                            selectedSubCategoryFunction()
                            return
                        }
                        output.style.display = 'block'
                        output.textContent = data.message
                        output.style.color = 'red'
                        removeError(output)

                    } catch (err) {
                        console.log('error whiile adding sub category.')
                    }

                })


                deleteSubCats()

                selectedSubCategoryFunction()





                addCollection.addEventListener('click', async () => {
                    console.log('clicked add button')
                    const newCollectionName = document.getElementById('new-collection').value
                    console.log(newCollectionName)
                    if (newCollectionName.length < 2) {
                        output.style.display = 'block'
                        output.textContent = 'collection name should be atleast 3 characters'
                        output.style.color = 'red'
                        return removeError(output)
                    }
                    try {
                        const response = await axios.post(`/admin/api/createCollection/${encodeURIComponent(newCollectionName)}/${encodeURIComponent(addCollection.value)}`)
                        const data = response.data
                        console.log('this is response of the colleciton create api', data)
                        if (!data.error) {
                            output.textContent = data.message
                            output.style.display = 'block'
                            output.style.color = 'green'
                            const coll = `
                                <li value="${data.collectionId}" class="_${data.collectionId}">
                                <input type="text" value="${newCollectionName.toUpperCase().trim()}">
                                <div class="df gap">
                                  <button class="edit-collection" value="${data.collectionId}" type="button">Edit</button>
                                  <button class="delete-collection" value="${data.collectionId}" type="button">Delete</button>
                                </div>
                              </li>
                                `
                            collectionList.innerHTML += coll
                            deleteCollection()
                            return removeError(output)
                        }
                        output.style.display = 'block'
                        output.textContent = data.message
                        output.style.color = 'red'
                        removeError(output)
                        console.log('calling delete function')
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