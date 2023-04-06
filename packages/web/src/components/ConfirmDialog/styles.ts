import { getSpacing } from "styles";
import styled from "styled-components";

export const StyledConfirmDialog = styled.div`
  min-width: 340px;
  max-width: 400px;
  width: 100%;
  color: var(--white);

  .description-container {
    margin-bottom: ${getSpacing(3)};
  }

  .button-container {
    display: flex;
    justify-content: space-between;
    gap: ${getSpacing(4)};
  }
`;
