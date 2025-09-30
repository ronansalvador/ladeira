const saveUser = (user) => {
  if (localStorage.getItem('user') === null) {
    localStorage.setItem('user', '')
  } else {
    localStorage.setItem('user', user)
  }
}

export default saveUser
