/*eslint-disable*/
import React from "react";
import {
  useTable,
  useFilters,
  useAsyncDebounce,
  useSortBy,
  usePagination,
  useResizeColumns,
  useBlockLayout
} from "react-table";
import classnames from "classnames";
// A great library for fuzzy filtering/sorting items
import matchSorter from "match-sorter";
// react plugin used to create DropdownMenu for selecting items
import Select from "react-select";

// reactstrap components
import { Container, Row, Col, FormGroup, Input } from "reactstrap";

// Define a default UI for filtering
function DefaultColumnFilter({
  column: { filterValue, preFilteredRows, setFilter },
}) {
  const count = preFilteredRows.length;

  return (
    <FormGroup>
      <Input
        // placeholder={`Search ${count} records...`}
        type="text"
        onChange={(e) => {
          setFilter(e.target.value || undefined); // Set undefined to remove the filter entirely
        }}
      />
    </FormGroup>
  );
}

function fuzzyTextFilterFn(rows, id, filterValue) {
  return matchSorter(rows, filterValue, { keys: [(row) => row.values[id]] });
}

// Let the table remove the filter if the string is empty
fuzzyTextFilterFn.autoRemove = (val) => !val;

// Our table component
function Table(props) {
  console.log(props)

  const [numberOfRows, setNumberOfRows] = React.useState({
    value: props.defaultPageSize,
    label: props.defaultPageSize + " " + props.rowsText,
  });

  const [pageSelect, handlePageSelect] = React.useState({
    value: 0,
    label: props.pageText + " 1",
  });

  const filterTypes = React.useMemo(
    () => ({
      // Add a new fuzzyTextFilterFn filter type.
      fuzzyText: fuzzyTextFilterFn,
      // Or, override the default text filter to use
      // "startWith"
      text: (rows, id, filterValue) => {
        return rows.filter((row) => {
          const rowValue = row.values[id];
          return rowValue !== undefined ?
            String(rowValue).toLowerCase().startsWith(String(filterValue).toLowerCase()) :
            true;
        });
      },
    }),
    []
  );

  const defaultColumn = React.useMemo(
    () => ({
      // Let's set up our default Filter UI
      Filter: DefaultColumnFilter,
      minWidth: 30,
      width: 150,
      maxWidth: 400,
    }),
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    rows,
    prepareRow,
    state,
    visibleColumns,
    pageOptions,
    pageCount,
    nextPage,
    previousPage,
    canPreviousPage,
    canNextPage,
    setPageSize,
    gotoPage,
  } = useTable(
    {
      columns: props.columns,
      data: props.data,
      disableFilters: props.disableFilters,
      defaultColumn, // Be sure to pass the defaultColumn option
      filterTypes,
      initialState: { pageSize: props.defaultPageSize, pageIndex: 0 },
    },
    useFilters, // useFilters!
    useSortBy,
    useBlockLayout,
    useResizeColumns,
    usePagination
  );

  // Used to push empty rows when data is not available
  let firstPageRows = Array.from(Array(numberOfRows.value).keys())

  let pageSelectOptions = Array.apply(null, Array(pageOptions.length)).map((prop, key) => {
    return {
      value: key,
      label: props.pageText + " " + (key + 1),
    };
  });
  let numberOfRowsData = [10, 25, 50, 100, 200];
  return (
    <>
      <div className="ReactTable -striped -highlight primary-pagination">
        {props.showPaginationTop &&
          <div className="pagination-top">
            <div className="-pagination">
              <div className="-previous">
                <button
                  type="button"
                  onClick={() => {
                    previousPage()
                    handlePageSelect(pageSelectOptions[pageSelect.value - 1])
                  }}
                  disabled={!canPreviousPage}
                  className="-btn"
                >
                  {props.previousText}
                </button>
              </div>
              <div className="-center">
                <Container>
                  <Row className="justify-content-center">
                    <Col xl="5" md="6" sm="12">
                      <Select
                        className="react-select primary rt-pagination"
                        classNamePrefix="react-select"
                        name="pageSelect"
                        value={pageSelect}
                        onChange={(value) => {
                          gotoPage(value.value);
                          handlePageSelect(value);
                        }}
                        options={pageSelectOptions}
                        noOptionsMessage={() => props.pageText + " 1"}
                      />
                    </Col>
                    <Col xl="5" md="6" sm="12">
                      <Select
                        className="react-select primary rt-pagination"
                        classNamePrefix="react-select"
                        name="numberOfRows"
                        value={numberOfRows}
                        onChange={(value) => {
                          setPageSize(value.value);
                          setNumberOfRows(value);
                        }}
                        options={numberOfRowsData.map((prop) => {
                          return {
                            value: prop,
                            label: prop + " " + props.rowsText,
                          };
                        })}
                      />
                    </Col>
                  </Row>
                </Container>
              </div>
              <div className="-next">
                <button
                  type="button"
                  onClick={() => {
                    nextPage()
                    handlePageSelect(pageSelectOptions[pageSelect.value + 1])
                  }}
                  disabled={!canNextPage}
                  className="-btn"
                >
                  {props.nextText}
                </button>
              </div>
            </div>
          </div>
        }
        <div>
          <table {...getTableProps()} className="rt-table">
            {/* Header */}
            <div className="rt-thead -header">
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()} className="rt-tr">
                  {headerGroup.headers.map((column, key) => {
                    return (
                      <th
                        {...column.getHeaderProps(column.getSortByToggleProps())}
                        className={classnames("rt-th rt-resizable-header", {
                          "-cursor-pointer": headerGroup.headers.length - 1 !== key,
                          "-sort-asc": column.isSorted && !column.isSortedDesc,
                          "-sort-desc": column.isSorted && column.isSortedDesc,
                        })}
                      >
                        <div className="rt-resizable-header-content">
                          {column.render("Header")}
                          <div
                            {...column.getResizerProps()}
                            className="resizer"
                          />
                        </div>
                        {/* Render the columns filter UI */}
                        <div>
                          {headerGroup.headers.length - 1 === key ?
                            null :
                            column.canFilter ?
                              column.render("Filter")
                              : null}
                        </div>
                      </th>
                    )
                  })}
                </tr>
              ))}
            </div>
            {/* Body */}
            <tbody {...getTableBodyProps()} className="rt-tbody">
              {page.length > 0 ?
                // Data is available
                page.map((row, i) => {
                  prepareRow(row);
                  return (
                    <tr
                      {...row.getRowProps()}
                      className={classnames("rt-tr", { " -odd": i % 2 === 0 }, { " -even": i % 2 === 1 })}
                    >
                      {row.cells.map((cell) => {
                        return (
                          <td {...cell.getCellProps()} className="rt-td">
                            {cell.render("Cell")}
                          </td>
                        )
                      })}
                    </tr>
                  )
                }) :
                // No data available
                firstPageRows.map((prop, i) => {
                  return (
                    <tr key={i} className={classnames("rt-tr", { " -odd": i % 2 === 0 }, { " -even": i % 2 === 1 })}>
                      {props.columns.map((prop, i) => {
                        return (<td key={i} className="rt-td" />)
                      })}
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
        </div>
        {/* Pagination Bottom */}
        {props.showPaginationBottom &&
          <div className="pagination-bottom">
            <div className="-pagination">
              <div className="-previous">
                <button
                  type="button"
                  onClick={() => {
                    previousPage()
                    handlePageSelect(pageSelectOptions[pageSelect.value - 1])
                  }}
                  disabled={!canPreviousPage}
                  className="-btn"
                >
                  {props.previousText}
                </button>
              </div>
              <div className="-center">
                <Container>
                  <Row className="justify-content-center">
                    <Col xl="5" md="6" sm="12">
                      <Select
                        className="react-select primary rt-pagination"
                        classNamePrefix="react-select"
                        name="pageSelect"
                        value={pageSelect}
                        onChange={(value) => {
                          gotoPage(value.value);
                          handlePageSelect(value);
                        }}
                        options={pageSelectOptions}
                        noOptionsMessage={() => props.pageText + " 1"}
                      />
                    </Col>
                    <Col xl="5" md="6" sm="12">
                      <Select
                        className="react-select primary rt-pagination"
                        classNamePrefix="react-select"
                        name="numberOfRows"
                        value={numberOfRows}
                        onChange={(value) => {
                          setPageSize(value.value);
                          setNumberOfRows(value);
                        }}
                        options={numberOfRowsData.map((prop) => {
                          return {
                            value: prop,
                            label: prop + " " + props.rowsText,
                          };
                        })}
                      />
                    </Col>
                  </Row>
                </Container>
              </div>
              <div className="-next">
                <button
                  type="button"
                  onClick={() => {
                    nextPage()
                    handlePageSelect(pageSelectOptions[pageSelect.value + 1])
                  }}
                  disabled={!canNextPage}
                  className="-btn"
                >
                  {props.nextText}
                </button>
              </div>
            </div>
          </div>
        }
        {page.length == 0 && <div className="rt-noData">{props.noDataText}</div>}
      </div>
      <pre>
        <code>{JSON.stringify(state, null, 2)}</code>
      </pre>
    </>
  );
}

// Define a custom filter filter function!
function filterGreaterThan(rows, id, filterValue) {
  return rows.filter((row) => {
    const rowValue = row.values[id];
    return rowValue >= filterValue;
  });
}

// This is an autoRemove method on the filter function that
// when given the new filter value and returns true, the filter
// will be automatically removed. Normally this is just an undefined
// check, but here, we want to remove the filter if it's not a number
filterGreaterThan.autoRemove = (val) => typeof val !== "number";

export default Table;
