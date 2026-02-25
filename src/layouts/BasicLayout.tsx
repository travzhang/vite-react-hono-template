import type {FC, ReactNode} from "react";

const BasicLayout: FC<{
  children: ReactNode;
}> = ({ children }) => {
  return <div>
    事实上
    {children}
  </div>
}

export default BasicLayout
