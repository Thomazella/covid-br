import React, { ReactNode, useMemo } from 'react'
import styled from 'styled-components'
import { useTable, useSortBy, Column } from 'react-table'

export type StateEntry = {
	date: string
	st: string
	td: number
	nd: number
	rtd?: number | null
	ptd?: number | null
	tc: number
	nc: number
	rtc?: number | null
	ptc?: number | null
}

type RowProps = {
	values: StateEntry
	index: number
}

type Cell = {
	row: RowProps
	column: { id: keyof StateEntry }
	data: StateEntry[]
	[key: string]: any
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

type StaticCellProps = {
	left?: ReactNode
	children?: ReactNode
	bold?: boolean
}

const CellWrapper = styled.div`
	padding: 0.375rem 0.75rem;
	display: flex;
	position: relative;
	align-items: baseline;
	& > * {
		flex: 1;
	}
	small {
		color: var(--color-base66);
	}
`

const Cell = ({ left, children, bold = true }: StaticCellProps) => (
	<CellWrapper>
		{!!left && <small>{left}</small>}
		{'\t'}
		{bold && <strong>{children}</strong>}
		{!bold && <div>{children}</div>}
	</CellWrapper>
)

type DynamicCellProps = {
	row: RowProps
	data?: StateEntry[]
	column: { id: keyof StateEntry }
	leftProp?: keyof StateEntry
	leftRender?: (x: ReactNode) => ReactNode
	children?: ReactNode
}

const DynamicCell = ({
	row,
	column,
	data,
	leftProp,
	leftRender = x => `+${x}`,
	children,
}: DynamicCellProps) => (
	<Cell left={leftProp && leftRender(data?.[row.index]?.[leftProp])}>
		{children || row.values?.[column.id]}
	</Cell>
)

const HeaderWrapper = styled.div`
	display: flex;
	justify-content: space-between;
	padding: 0.5rem 0.75rem;
	border-radius: 0.25rem;
	background: var(--color-base06);
	color: var(--color-base66);
	box-shadow: 0 0 0 0.25rem var(--color-base00);
	&:hover {
		background: var(--color-base);
		color: var(--color-base00);
	}
`

const Header = ({ children, column }: HeaderProps) => (
	<HeaderWrapper>
		<strong>{children}</strong>{' '}
		<span>{column.isSorted ? (column.isSortedDesc ? '↓' : '↑') : '·'}</span>
	</HeaderWrapper>
)

const TotalRow = styled.tr`
	td {
		background: transparent !important;
		position: sticky;
		bottom: 0;
	}
	& > * > * {
		background: var(--color-base00);
		padding-top: 1rem;
		padding-bottom: 1rem;
		border-top: 1px solid var(--color-base11);
		margin-top: 0.125rem;
		/* box-shadow: 0 -0.5rem 1rem var(--color-base00); */
	}
`

const Table = styled.table`
	width: 100%;
	text-align: right;
	margin: 0 -0.25rem;
	position: relative;
	th:first-child,
	td:first-child {
		text-align: left;
	}
	th {
		position: sticky;
		top: 0.25rem;
		z-index: 1;
		&:nth-child(1) {
			z-index: 3;
		}
		&:nth-child(2) {
			z-index: 2;
		}
	}
	tr:nth-child(2n) > * {
		background: var(--color-base03);
	}
`

type StateMeta = {
	p: number
	n: string
}

export type StatesMeta = {
	[key: string]: StateMeta
}

type StatesTableProps = {
	data: StateEntry[]
	total: StateEntry
	statesMeta: StatesMeta
}

type SortByOptions = {
	id: keyof StateEntry
	desc: boolean
}

type InitialTableState = {
	sortBy: SortByOptions[]
}

const initialState: InitialTableState = {
	sortBy: [{ id: 'tc', desc: true }],
}

const StatesTable = ({ data, total, statesMeta }: StatesTableProps) => {
	const columns: Column<StateEntry>[] = useMemo(
		() => [
			{
				accessor: 'st',
				Header: (x: Header) => <Header {...x}>State</Header>,
				sortInverted: true,
				Cell: ({ row }: Cell) => (
					<Cell bold={false}>
						<strong>{row.values.st} </strong>
						<small>{statesMeta[row.values.st].n}</small>
					</Cell>
				),
			},
			{
				accessor: 'tc',
				Header: (x: Header) => <Header {...x}>Confirmed</Header>,
				Cell: ({ row, column }: Cell) => (
					<DynamicCell row={row} column={column} data={data} leftProp='nc' />
				),
			},
			{
				accessor: 'td',
				Header: (x: Header) => <Header {...x}>Deaths</Header>,
				Cell: ({ row, column }: Cell) => (
					<DynamicCell row={row} column={column} data={data} leftProp='nd' />
				),
			},
		],
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[data],
	)

	const {
		getTableProps,
		getTableBodyProps,
		headerGroups,
		rows,
		prepareRow,
		toggleSortBy,
	} = useTable(
		{
			columns,
			// @ts-ignore
			initialState,
			data,
			footerGroups: total,
			autoResetSortBy: false,
		},
		useSortBy,
	)

	return (
		<Table {...getTableProps()}>
			<thead>
				{headerGroups.map((headerGroup: any) => (
					<tr {...headerGroup.getHeaderGroupProps()}>
						{headerGroup.headers.map((column: any) => (
							<th
								{...column.getHeaderProps(
									column.getSortByToggleProps({
										onClick: () => toggleSortBy(column.id, true),
									}),
								)}
							>
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
				<TotalRow>
					<td>
						<Cell>{total.st}</Cell>
					</td>
					<td>
						<Cell left={`+${total.nc}`}>{total.tc}</Cell>
					</td>
					<td>
						<Cell left={`+${total.nd}`}>{total.td}</Cell>
					</td>
				</TotalRow>
			</tbody>
		</Table>
	)
}

export default StatesTable
