const ListRender =({ name, age})=>{
   return age >= 18 ? <li>{name}</li> : null
}
export default ListRender