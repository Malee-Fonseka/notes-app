import React, {useState} from 'react'
import ProfileInfo from '../Cards/ProfileInfo'
import { useNavigate } from 'react-router-dom'
import SearchBar from '../SearchBar/SearchBar'

const Navbar = ( {userInfo, onSearchNote, handleClearSearch } ) => {

  const [searchQuerry, setSearchQuerry] = useState("")
  const navigate = useNavigate()

  const onLogout = () => {
    localStorage.clear()
    navigate("/login")
  }

  const handleSearch = () => {
    if(searchQuerry) {
      onSearchNote(searchQuerry)
    }
  }

  const onClearSearch = () => {
    setSearchQuerry("")
    handleClearSearch()
  }

  return (
    <>
      <div className="bg-white flex items-center justify-between px-6 py-2 drop-shadow">
        <h2 className="text-xl font-medium text-black py-2"> Notes </h2>

        <SearchBar value={searchQuerry} onChange={({target}) => {
          setSearchQuerry(target.value)
        }}
        handleSearch={handleSearch}
        onClearSearch={onClearSearch} />

        <ProfileInfo userInfo = {userInfo} onLogout={onLogout} />
      </div>
    </>
  )
}

export default Navbar