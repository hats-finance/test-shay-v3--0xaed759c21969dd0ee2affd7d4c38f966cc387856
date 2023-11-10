import styled, { css } from "styled-components";
import { getSpacing } from "styles";
import { breakpointsDefinition } from "styles/breakpoints.styles";

export const StyledHackerProfilePage = styled.div<{ unlinkDisabled: boolean }>(
  ({ unlinkDisabled }) => css`
    padding-bottom: ${getSpacing(8)};

    .header {
      padding-bottom: ${getSpacing(3)};
      border-bottom: 1px solid var(--primary-light);

      .profile-card {
        display: flex;
        align-items: center;
        padding-bottom: ${getSpacing(3)};

        .description {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: ${getSpacing(0.5)};
          padding: 0 ${getSpacing(5)};
          font-family: "IBM Plex Mono", monospace;

          h2 {
            font-size: var(--large-2);
          }

          p.hacker-title {
            font-size: var(--moderate-big);
          }

          p.hacker-date {
            font-size: var(--xmsall);
          }
        }

        .socials {
          display: flex;
          flex-direction: column;
          gap: ${getSpacing(1)};

          svg {
            width: ${getSpacing(5)};
            height: ${getSpacing(5)};
            cursor: pointer;
            transition: opacity 0.2s ease-in-out;

            &:hover {
              opacity: 0.8;
            }
          }
        }
      }

      .actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: ${getSpacing(5)};

        .buttons {
          display: flex;
          align-items: center;
          gap: ${getSpacing(2)};
        }

        .linked-addresses {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: ${getSpacing(0.5)};

          .addresses-list {
            display: flex;
            flex-wrap: wrap;
            gap: ${getSpacing(1)};

            .address {
              position: relative;
              display: flex;
              align-items: center;
              gap: ${getSpacing(1)};

              ${!unlinkDisabled &&
              css`
                &:hover {
                  &::after {
                    cursor: pointer;
                    content: "Unlink";
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    background: var(--error-red);
                    top: 0;
                    left: 0;
                    border-radius: 100px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  }
                }
              `}
            }
          }
        }
      }
    }

    .stats-container {
      display: flex;
      gap: ${getSpacing(14)};
      margin-top: ${getSpacing(4)};

      @media (max-width: ${breakpointsDefinition.mediumMobile}) {
        flex-direction: column;
        gap: ${getSpacing(4)};
      }

      h3 {
        font-size: var(--medium);
        font-weight: 500;
        margin-bottom: ${getSpacing(3)};

        @media (max-width: ${breakpointsDefinition.mediumMobile}) {
          margin-bottom: ${getSpacing(1.5)};
        }
      }

      .about {
        flex: 2;
      }

      .findings {
        flex: 3;

        .total-rewards {
          display: flex;
          align-items: center;
          gap: ${getSpacing(2)};
          margin-bottom: ${getSpacing(3)};

          h3 {
            margin-bottom: 0;
          }

          div.totalPrizes {
            display: flex;
            align-items: baseline;
            gap: ${getSpacing(1)};

            p {
              font-size: var(--medium-2);
              color: var(--secondary);
              font-weight: 700;
            }
          }
        }

        .findings-list {
          display: flex;
          flex-wrap: wrap;
          column-gap: ${getSpacing(10)};
          row-gap: ${getSpacing(6)};

          @media (max-width: ${breakpointsDefinition.mediumMobile}) {
            column-gap: ${getSpacing(3)};
          }

          .stat {
            width: fit-content;
            display: flex;
            gap: ${getSpacing(2)};
            flex-direction: column;
            align-items: center;
            justify-content: center;

            @media (max-width: ${breakpointsDefinition.mediumMobile}) {
              gap: ${getSpacing(1)};
            }

            .count {
              font-size: var(--moderate);
              font-weight: 700;
              font-family: "IBM Plex Mono", monospace;
            }
          }
        }
      }
    }
  `
);
