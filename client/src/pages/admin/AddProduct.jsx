import React, { useState } from "react";
import axios from "axios";
import styles from "../../styles/styles";
import { toast } from "react-toastify";

const AddProduct = () => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");
  const [brand, setBrand] = useState("");
  const [productIsNew, setProductIsNew] = useState(true);
  const [subtitle, setSubtitle] = useState("");
  const [images, setImages] = useState([]);

  const handleImageChange = (e) => {
    setImages([...e.target.files]);
  };

  const addProd = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("descriptoion", description);
    formData.append("category", category);
    formData.append("stock", stock);
    formData.append("brand", brand);
    formData.append("productIsNew", productIsNew);
    formData.append("subtitle", subtitle);

    images.forEach((image) => {
      formData.append("files", image);
    });

    try {
      const response = await axios.post(
        "http://localhost:9000/api/v2/create-new-product",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response?.error) {
        toast.error("Error Adding Product")
      }
      else{
        toast.success("Product Added Successfully")
        setName("")
        setBrand("")
        setSubtitle("")
        setPrice("")
        setProductIsNew(false)
        setCategory("")
        setDescription("")
        setBrand("")
      }
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="w-full px-5">
      <div>
        <h1 className="font-semibold text-2xl mb-7">Add Product</h1>
      </div>
      <div>
        <form onSubmit={addProd}>
          <div className="w-full 800px:flex block pb-5">
            <div className="w-[100%] 800px:w-[50%]">
              <label className="block pb-2 font-semibold text-gray-700">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={`${styles.input} w-[95%]`}
              />
            </div>
            <div className="w-[100%] 800px:w-[50%]">
              <label className="block pb-2 font-semibold text-gray-700">
                Subtitle
              </label>
              <input
                type="text"
                value={subtitle}
                className={`${styles.input} w-[95%]`}
                onChange={(e) => setSubtitle(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="w-full 800px:flex block pb-5">
            <div className="w-[100%] 800px:w-[50%]">
              <label className="block pb-2 font-semibold text-gray-700">
                Brand
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className={`${styles.input} w-[95%] rounded-sm`}
                required
              />
            </div>
            <div className="w-[100%] 800px:w-[50%]">
              <label className="block pb-2 font-semibold text-gray-700">
                Description
              </label>
              <textarea
                value={description}
                className={`${styles.input} w-[95%] rounded-sm`}
                onChange={(e) => setDescription(e.target.value)}
                required
              ></textarea>
            </div>
          </div>
          <div className="w-full 800px:flex block pb-5">
            <div className="w-[100%] 800px:w-[50%]">
              <label className="block pb-2 font-semibold text-gray-700">
                Category
              </label>
              <input
                type="text"
                className={`${styles.input} w-[95%] rounded-sm`}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />
            </div>
            <div className="w-[100%] 800px:w-[50%]">
              <label className="block pb-2 font-semibold text-gray-700">
                Price
              </label>
              <input
                className={`${styles.input} w-[95%] rounded-sm`}
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="w-full 800px:flex block pb-5">
            <div className="w-[100%] 800px:w-[50%]">
              <label className="block pb-2 font-semibold text-gray-700">
                Stock
              </label>
              <input
                type="number"
                className={`${styles.input} w-[95%] rounded-sm`}
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
              />
            </div>
            <div className="w-[100%] mt-9 800px:w-[50%] items-center justify-center">
              <label className=" pb-2 font-semibold text-gray-700">
                Product Is New
              </label>
              <input
                type="checkbox"
                checked={productIsNew}
                className="ml-2 w-5 h-5"
                onChange={(e) => setProductIsNew(e.target.checked)}
              />
            </div>
          </div>
          <div className="w-full 800px:flex block pb-5">
            <div className="w-[100%] 800px:w-[100%]">
              <label className="block pb-2 font-semibold text-gray-700">
                Images
              </label>
              <input type="file" multiple onChange={handleImageChange} />
            </div>
          </div>

          <div>
            <button type="submit" className="p-3 text-indigo-800 border border-gray-500 rounded-sm">Add Product</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
