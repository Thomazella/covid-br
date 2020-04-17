import React, { ReactNode, useMemo } from 'react'
import styled from 'styled-components'
import { useTable, useSortBy } from 'react-table'

export type StateEntry = {
	date: string
	st: string
	td: string
	nd: string
	nc: string
	tc: string
}

export type StateEntries = StateEntry[]

type Accessor<T> = keyof T

type Column = {
	accessor: Accessor<StateEntry>
	Header: string | ReactNode
	Cell?: any
	[key: string]: any
}

type Columns = Column[]

type Cell = { row: { values: StateEntry } }
type CellProps = {
	row: { values: StateEntry }
	prop: keyof StateEntry
	newProp?: keyof StateEntry
	children?: ReactNode
	toggleSortBy?: (id: string, desc?: boolean, isMulti?: boolean) => void
}

type Header = any
type HeaderProps = {
	children?: ReactNode
	column: {
		isSorted: boolean
		isSortedDesc: boolean
	}
	[key: string]: any
}

const noop = () => null

const Cell = ({ row, prop, newProp, children, toggleSortBy = noop }: CellProps) => (
	<div style={{ display: 'flex' }}>
		{newProp && !!row.values?.[newProp] && (
			<small onClick={() => toggleSortBy(newProp)} style={{ flex: 1 }}>+{row.values?.[newProp]}</small>
		)}
		{'\t'}
		<strong style={{ flex: 1 }}>
			{row.values?.[prop]}
			{children}
		</strong>
	</div>
)

const Header = ({ children, column }: HeaderProps) => (
	<div>
		<strong>{children}</strong>
		{' '}
		{column.isSorted ? (column.isSortedDesc ? '↓' : '↑') : '↕'}
	</div>
)

const Table = styled.table`
	width: 100%;
	text-align: right;
	th:first-child,
	td:first-child {
		text-align: left;
	}
`

type StatesTableProps = {
	data: StateEntries
	total: StateEntry
}

const StatesTable = ({ data, total }: StatesTableProps) => {
	const columns: Columns = useMemo(
		() => [
			{ accessor: 'st', Header: (x: Header) => <Header {...x}>State</Header> },
			{
				accessor: 'tc',
				Header: (x: Header) => <Header {...x}>Confirmed</Header>,
				Cell: ({ row }: Cell) => (
					<Cell row={row} prop='tc' newProp='nc' toggleSortBy={toggleSortBy} />
				),
			},
			{
				accessor: 'td',
				Header: (x: Header) => <Header {...x}>Deaths</Header>,
				Cell: ({ row }: Cell) => (
					<Cell row={row} prop='td' newProp='nd' toggleSortBy={toggleSortBy} />
				),
			},
			{
				accessor: 'nc',
				Header: noop,
				Cell: noop,
			},
			{
				accessor: 'nd',
				Header: noop,
				Cell: noop,
			},
		],
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[],
	)
	
	const {
		getTableProps,
		getTableBodyProps,
		headerGroups,
		rows,
		prepareRow,
		toggleSortBy,
		// @ts-ignore
	} = useTable({ columns, data, footerGroups: total, autoResetSortBy: false }, useSortBy)

	return (
		<Table {...getTableProps()}>
			<thead>
				{headerGroups.map((headerGroup: any) => (
					<tr {...headerGroup.getHeaderGroupProps()}>
						{headerGroup.headers.map((column: any) => (
							<th {...column.getHeaderProps(column.getSortByToggleProps())}>
								{column.render('Header')}
							</th>
						))}
					</tr>
				))}
			</thead>
			<tbody {...getTableBodyProps()}>
				{rows.map((row: any) => {
					prepareRow(row)
					return (
						<tr {...row.getRowProps()}>
							{row.cells.map((cell: any) => (
								<td {...cell.getCellProps()}>{cell.render('Cell')}</td>
							))}
						</tr>
					)
				})}
				<tr>
					<td><Cell row={{ values: total }} prop='st' /></td>
					<td><Cell row={{ values: total }} prop='tc' newProp='nc' /></td>
					<td><Cell row={{ values: total }} prop='td' newProp='nd' /></td>
				</tr>
			</tbody>
			{/* <pre>{JSON.stringify(total, null, 2)}</pre> */}
		</Table>
	)
}

export default StatesTable
