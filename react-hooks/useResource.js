export const useResource = key => {
  // state.resource是存储全局静态资源的地方
  const res = useSelector(state => state.resource[key])
  const dispatch = useDispatch()

  const { inited, loading, data } = res

  useEffect(() => {
    if (!inited && !loading) {
      dispatch(createResourceAction(key))
    }
  }, [dispatch])

  return res
}
