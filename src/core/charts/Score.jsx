import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardTitle,
  Spinner,
} from "reactstrap";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer
} from 'recharts';

import { getScoreData } from "../../core/charts/data.js";


class Score extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      langId: this.props.langId,
      compId: this.constructor.name.toLowerCase(),
      data: undefined,
      isLoading: true,
    }
  }
  static getDerivedStateFromProps(props, state) {
    if (props.langId !== state.langId) {
      return {
        langId: props.langId
      }
    }
    return null
  }
  async componentDidMount() {
    let scoreData = await getScoreData('SAO', 'd')

    this.setState({
      data: scoreData,
      isLoading: false,
    })
  }

  render() {
    let { getString } = this.props;
    let { langId, compId, data, isLoading } = this.state;

    return (
      <Card>
        <CardHeader>
          <CardTitle tag="h4">Score</CardTitle>
          <p className="card-category">Something interesting here...</p>
        </CardHeader>
        <ResponsiveContainer width="100%" height={300}>
          {isLoading === true ? <Spinner position="center" animation="border" size="sm" /> :

            <BarChart
              layout="vertical" data={data.SAO}
              margin={{ top: 5, right: 30, left: 30, bottom: 5, }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <YAxis dataKey="asset" type="category" />
              <XAxis type="number" />
              <Tooltip />
              <Legend />
              <ReferenceLine x={7} stroke="#000" />
              <Bar dataKey="score" fill="#8884d8" layout="vertical" />
            </BarChart>
            // <Bar
            //   data={data}
            //   options={options}
            // />
          }
        </ResponsiveContainer>
        <CardFooter>
          <div className="legend">
            <i className="fa fa-circle text-info" />
            Tesla Model S
            <i className="fa fa-circle text-danger" />
            BMW 5 Series
                  </div>
          <hr />
          <div className="stats">
            <i className="fa fa-check" />
            Data information certified
                  </div>
        </CardFooter>
      </Card>
    )
  }
}

export default Score;