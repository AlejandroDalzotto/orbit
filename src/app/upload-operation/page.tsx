export default function UploadOperationPage() {
  return (
    <div>

      <h1>Upload Operation</h1>

      <form>
        <div className="flex gap-x-5 items-center">
          <select name="type">
            <option value="expense">expense</option>
            <option value="income">income</option>
          </select>

          <input type="number" name="amount" />
        </div>

        <input type="date" name="date" />

        <button type="submit">Save</button>

      </form>
    </div>
  )
}
