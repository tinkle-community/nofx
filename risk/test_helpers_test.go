package risk

import "nofx/featureflag"

func newRuntimeFlagsForTest(mutator func(*featureflag.State)) *featureflag.RuntimeFlags {
	state := featureflag.DefaultState()
	if mutator != nil {
		mutator(&state)
	}
	return featureflag.NewRuntimeFlags(state)
}
