//
import { useState } from "react";
import "./style.css";
import html2pdf from "html2pdf.js";

const initialItems = [
  {
    id: 1,
    itemName: "Banana",
    price: 7,
    type: "food",
  },
  {
    id: 2,
    itemName: "Apple",
    price: 20,
    type: "food",
  },
  {
    id: 3,
    itemName: "Orange",
    price: 4,
    type: "food",
  },
  {
    id: 4,
    itemName: "Pear",
    price: 4,
    type: "food",
  },
  {
    id: 5,
    itemName: "Espresso",
    price: 4,
    type: "drink",
  },
];

export default function App() {
  // const [test, setTest] = useState("test");
  const [allItems, setAllItem] = useState(initialItems);
  const [selectedItem, setSelectedItem] = useState(null);
  const [billItem, setBillItem] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const [isOpen, setIsOpen] = useState(false);

  //const [editItem, setEditItem] = useState(null);

  function isItemAddedToBill(itemId) {
    return billItem.some((item) => item.id === itemId);
  }

  function handleSearch(e) {
    e.preventDefault();
    setSearchTerm(e.target.value);
  }

  function handleSelectedItem(itemObj) {
    console.log(itemObj);
    setSelectedItem((currentSelected) =>
      currentSelected?.id === itemObj.id ? null : itemObj,
    );
  }
  function handleSubtract() {
    setQuantity((c) => c - 1);
  }
  function handleAdd() {
    setQuantity((c) => c + 1);
  }

  function handleAddItemToBill(newItemObj) {
    setBillItem((prevBillItems) => [...prevBillItems, newItemObj]); //<-recived newItem
    setQuantity(1);
    setSelectedItem(null);
    setSearchTerm("");
  }

  function handleUpdateItem(updatedItem) {
    setBillItem((prevBillItem) =>
      prevBillItem.map((item) =>
        item.id === updatedItem.id
          ? { ...item, quantity: updatedItem.quantity }
          : item,
      ),
    );
    console.log(updatedItem);
  }

  function handleDeleteItem(id) {
    setBillItem((prevBillItems) =>
      prevBillItems.filter((items) => items.id !== id),
    );
  }

  return (
    <>
      <Nav />

      <div className="main">
        <AllItems
          allItems={allItems}
          onSelection={handleSelectedItem}
          searchTerm={searchTerm}
          onSearch={handleSearch}
          isItemAddedToBill={isItemAddedToBill}
        />

        {selectedItem && (
          <SelectedItemList
            selectedItem={selectedItem}
            quantity={quantity}
            setQuantity={setQuantity}
            onSubtract={handleSubtract}
            onAdd={handleAdd}
            onAddItemToBill={handleAddItemToBill}
            onUpdateItem={handleUpdateItem}
          />
        )}

        {billItem.length > 0 ? (
          <BillItems
            selectedItem={selectedItem}
            billItem={billItem}
            onDeleteItem={handleDeleteItem}
            onSelection={handleSelectedItem}
            onUpdateItem={handleUpdateItem}
            //onAddItemToBill={handleAddItemToBill}
          />
        ) : (
          <></>
        )}
      </div>

      <button className="close" onClick={() => setIsOpen((toglle) => !toglle)}>
        {isOpen ? "Close" : "Open"}
      </button>
      {isOpen ? <PDFExporter billItem={billItem} /> : <></>}
    </>
  );
}

function Nav() {
  return <h1>Navigation</h1>;
}
function AllItems({
  allItems,
  onSelection,
  searchTerm,
  onSearch,
  isItemAddedToBill,
}) {
  const filteredItem = allItems.filter((item) =>
    item.itemName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="leftSide">
      <h2>AllItems</h2>

      <div className="all-items-container">
        <input
          className="search-input"
          type="text"
          placeholder="Search item..."
          value={searchTerm}
          onChange={onSearch}
        />
        <ul className="item-list">
          {filteredItem.map((item) => (
            <Item
              item={item}
              key={item.id}
              onSelection={onSelection}
              disabled={isItemAddedToBill(item.id)}
            />
          ))}
        </ul>
        {filteredItem < 1 && <AddNewItem searchTerm={searchTerm} />}
      </div>
    </div>
  );
}

function Item({ item, onSelection, disabled }) {
  return (
    <li
      className={`item-card ${disabled ? "disabled" : ""}`}
      onClick={() => !disabled && onSelection(item)}
    >
      <p className="item-name">{item.itemName}</p>
      <p className="item-price">{item.price}€</p>
    </li>
  );
}

function AddNewItem({ searchTerm }) {
  return (
    <div>
      <h2>Item {searchTerm} does not exist, add new Item?</h2>
      <button>Add new Item</button>
    </div>
  );
}

function SelectedItemList({
  selectedItem,
  onUpdateItem,
  onAdd,
  onSubtract,
  quantity,
  setQuantity,
  onAddItemToBill,
}) {
  function handleSubmit(e) {
    e.preventDefault();

    const newItemObj = {
      id: selectedItem?.id,
      itemName: selectedItem?.itemName,
      quantity,
      type: selectedItem?.type,
      price: selectedItem?.price,
    };
    onAddItemToBill(newItemObj);
    //   console.log(newItemObj);
  }
  return (
    <div className="center">
      <div className="selected-item-container">
        <table className="invoice-items">
          <thead>
            <th>ItemName</th>
            <th>Type</th>
            <th colSpan="3">setQuantity</th>
          </thead>
          <tbody>
            <tr>
              <td>{selectedItem?.itemName}</td>
              <td>{selectedItem?.type}</td>
              <td>
                <button onClick={onSubtract}>-</button>
              </td>
              <td>
                <input
                  type="number"
                  min="1"
                  maxLength="3"
                  size="5"
                  placeholder="quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                ></input>
              </td>
              <td>
                <button onClick={onAdd}>+</button>
              </td>
            </tr>
            <tr>
              <td colSpan="5">
                <button className="add-to-bill-btn" onClick={handleSubmit}>
                  AddToBill
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BillItems({
  billItem,
  onDeleteItem,
  onSelection,
  onUpdateItem,
  selectedItem,
}) {
  const totalPrice = billItem.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  //   console.log(totalPrice);

  const totalFood =
    billItem
      .filter((item) => item.type === "food")
      .reduce((acc, item) => acc + item.price * item.quantity, 0) * 0.07;

  const totalDrink =
    billItem
      .filter((item) => item.type === "drink")
      .reduce((acc, item) => acc + item.price * item.quantity, 0) * 0.19;
  return (
    <div className="rightSide">
      <div className="invoice-container">
        <h2 className="invoice-header">Bill</h2>
        <table className="invoice-items" id="bill-table">
          <thead>
            <th>ItemName</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Delete</th>
          </thead>

          {billItem.map((item, index) => (
            <>
              <BillItem
                selectedItem={selectedItem}
                item={item}
                key={index}
                onDeleteItem={onDeleteItem}
                billItem={billItem}
                totalDrink={totalDrink}
                totalFood={totalFood}
                onSelection={onSelection}
                onUpdateItem={onUpdateItem}
              />
            </>
          ))}
        </table>
        <div className="invoice-total">
          <span>Total Price:{totalPrice} €</span>
          <br />
          <span>VAT food:{totalFood.toFixed(2)} €</span>
          <br />
          <span>VAT drinks:{totalDrink.toFixed(2)} €</span>
          <br />
          <span>
            <label>Got some tip: </label>
            <input
              type="number"
              min={1}
              maxLength="3"
              size="7"
              placeholder="AddTipValue"
            ></input>
            €
          </span>
        </div>
      </div>
    </div>
  );
}

function BillItem({ item, onDeleteItem, onUpdateItem }) {
  const itemPrice = item.price * item.quantity;

  return (
    <>
      <tbody>
        {/* <tr className="invoice-item-row" onClick={() => onSelection(item)}> */}
        <tr className="invoice-item-row">
          <td>{item.itemName}</td>
          <td>
            <input
              type="number"
              min={1}
              maxLength="3"
              size="7"
              value={item.quantity}
              onChange={(e) =>
                onUpdateItem({ ...item, quantity: Number(e.target.value) })
              }
            ></input>
          </td>
          <td>{itemPrice}</td>
          <td>
            <button
              className="delete-button"
              onClick={() => onDeleteItem(item.id)}
            >
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </>
  );
}

function PDFExporter({ billItem }) {
  console.log(billItem);
  const exportToPDF = () => {
    const element = document.getElementById("contentToExport"); // Id of the element you want to export
    const opt = {
      margin: 0.5,
      filename: "your_document.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    html2pdf().from(element).set(opt).save();
  };

  return (
    <div>
      <div id="contentToExport">
        {/* Content you want to export */}
        <h2>Bill Items</h2>
        <table>
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Quantity</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {billItem.map((item) => (
              <tr key={item.id}>
                <td>{item.itemName}</td>
                <td>{item.quantity}</td>
                <td>{item.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={exportToPDF}>Print</button>
    </div>
  );
}
