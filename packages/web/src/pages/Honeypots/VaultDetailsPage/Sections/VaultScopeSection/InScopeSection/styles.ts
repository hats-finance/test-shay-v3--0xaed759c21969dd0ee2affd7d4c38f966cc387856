import styled, { css } from "styled-components";
import { getSpacing } from "styles";

export const StyledInScopeSection = styled.div`
  .code-languages {
    display: flex;
    gap: ${getSpacing(1)};
    margin-top: ${getSpacing(3)};
  }

  .repos {
    display: flex;
    flex-direction: column;
    gap: ${getSpacing(2)};

    .repo {
      border: 1px solid var(--primary-light);
      padding: ${getSpacing(2)} ${getSpacing(3)};
      display: flex;
      justify-content: space-between;
      align-items: center;

      .info {
        display: flex;
        flex-direction: column;
        gap: ${getSpacing(0.5)};

        .commit-hash {
          font-size: var(--tiny);
          color: var(--grey-500);
        }
      }
    }
  }
`;

export const StyledContractsList = styled.div<{ isOldVersion: boolean }>(
  ({ isOldVersion }) => css`
    display: flex;
    flex-direction: column;

    .header-titles,
    .contract {
      display: grid;
      gap: ${getSpacing(1)};
      align-items: center;
      grid-template-columns: ${isOldVersion ? "1fr 1fr" : "2fr 1fr 2fr 2fr"};
      padding: ${getSpacing(2)} ${getSpacing(3)};
    }

    .contract {
      border: 1px solid var(--primary-light);
      border-bottom: none;

      &:last-child {
        border-bottom: 1px solid var(--primary-light);
      }
    }

    .deployments {
      display: flex;
      flex-direction: column;
      gap: ${getSpacing(1)};

      a.deployment {
        display: flex;
        align-items: center;
        gap: ${getSpacing(1)};
        cursor: pointer;
        transition: 0.2s;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }

        .chain {
          font-weight: 700;
        }

        .icon {
          font-size: var(--moderate);
        }
      }
    }
  `
);
