// custom_indicators_getter(PineJS) {
//                 return Promise.resolve([
//                     { }
//                 ])
//             }

export const squeezeMomentumIndicator = {
    name: 'Squeeze Momentum Indicator',
    metainfo: {
      _metainfoVersion: 51,
      id: 'SqueezeMomentumIndicator@tv-basicstudies-1',
      description: 'Squeeze Momentum Indicator',
      shortDescription: 'SQZMOM_LB',
      is_hidden_study: false,
      is_price_study: false,
      isCustomIndicator: true,
      plots: [
        { id: 'plot_0', type: 'histogram' },
        { id: 'plot_1', type: 'histogram' },
      ],
      defaults: {
        styles: {
          plot_0: {
            visible: true,
            linewidth: 4,
            plottype: 1,
            trackPrice: false,
            color: '#26a69a',
          },
          plot_1: {
            visible: true,
            linewidth: 4,
            plottype: 1,
            trackPrice: false,
            color: '#ef5350',
          },
        },
        precision: 1,
        inputs: {},
      },
      styles: {
        plot_0: {
          title: 'Squeeze momentum value',
        },
      },
      inputs: [],
    },
    constructor: function () {
      this.init = function (context, inputCallback) {
        this._context = context;
        this._input = inputCallback;
      };
  
      this.main = function (context, inputCallback) {
        this._context = context;
        this._input = inputCallback;
  
        const lengthKC = 20;
        const close = this._context.new_var(PineJS.Std.close(this._context));
        const high = this._context.new_var(PineJS.Std.high(this._context));
        const low = this._context.new_var(PineJS.Std.low(this._context));
  
        const highest = PineJS.Std.highest(high, lengthKC, context);
        const lowest = PineJS.Std.lowest(low, lengthKC, context);
        const highestLowestAvg = PineJS.Std.avg(highest, lowest);
  
        const avg = PineJS.Std.avg(
          highestLowestAvg,
          PineJS.Std.sma(close, lengthKC, context)
        );
  
        const sub = this._context.new_var(close - avg);
        const val = PineJS.Std.linreg(sub, lengthKC, 0, context);
  
        const plot1Val = val > 0 ? val : 0;
        const plot2Val = val < 0 ? val : 0;
  
        return [plot1Val, plot2Val];
      };
    },
  };
  